import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import {
  ApiQuizResult,
  ApiWord,
  apiDeleteWord,
  apiSyncQuizResults,
  apiSyncWords,
  apiUpdateProfile,
  getToken,
  isNetworkError,
  ProfileUpdateData,
} from "./api";

const QUEUE_KEY = "sync_queue_v1";

// ─── Operatsiya turlari ───────────────────────────────────────────────────────

export type SyncOp =
  | { id: string; type: "word.upsert"; payload: ApiWord }
  | { id: string; type: "word.delete"; payload: { clientId: string } }
  | { id: string; type: "quiz.save"; payload: ApiQuizResult }
  | { id: string; type: "profile.update"; payload: ProfileUpdateData };

// ─── Navbat holati ────────────────────────────────────────────────────────────

let isFlushing = false;
const listeners = new Set<(pending: number) => void>();

async function loadQueue(): Promise<SyncOp[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncOp[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(ops: SyncOp[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
  listeners.forEach((fn) => fn(ops.length));
}

/** Navbatdagi yuborilmagan operatsiyalar soni */
export async function getPendingCount(): Promise<number> {
  return (await loadQueue()).length;
}

/** Navbat o'zgarganda xabar berish (UI indikatori uchun) */
export function onQueueChange(fn: (pending: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─── Navbatga qo'shish ────────────────────────────────────────────────────────

/**
 * Operatsiyani navbatga qo'shadi va darhol yuborishga urinadi.
 * Offline bo'lsa navbatda qoladi — internet paydo bo'lganda avtomatik ketadi.
 */
export async function enqueue(op: Omit<SyncOp, "id">): Promise<void> {
  const queue = await loadQueue();

  // Bir xil obyekt ustidagi eski operatsiyani olib tashlaymiz (oxirgisi g'olib)
  const key = opKey(op as SyncOp);
  const deduped = queue.filter((q) => opKey(q) !== key);

  deduped.push({ ...op, id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}` } as SyncOp);
  await saveQueue(deduped);

  flush().catch(() => {});
}

/** Bir nechta operatsiyani birdan navbatga qo'shish (login paytidagi ommaviy yuklash) */
export async function enqueueMany(ops: Omit<SyncOp, "id">[]): Promise<void> {
  if (ops.length === 0) return;

  const queue = await loadQueue();
  const newKeys = new Set(ops.map((o) => opKey(o as SyncOp)));
  const deduped = queue.filter((q) => !newKeys.has(opKey(q)));

  for (const op of ops) {
    deduped.push({
      ...op,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    } as SyncOp);
  }
  await saveQueue(deduped);

  flush().catch(() => {});
}

/** Operatsiya kaliti — qaysilar bir-birini bekor qilishini aniqlaydi */
function opKey(op: SyncOp): string {
  switch (op.type) {
    case "word.upsert":
      return `word:${op.payload.clientId}`;
    case "word.delete":
      return `word:${op.payload.clientId}`;
    case "quiz.save":
      return `quiz:${op.payload.bookId}:${op.payload.unitNum}`;
    case "profile.update":
      return "profile";
  }
}

// ─── Navbatni bo'shatish ──────────────────────────────────────────────────────

/**
 * Navbatni ketma-ket backendga yuboradi.
 * - Tarmoq xatosi → to'xtaydi, qolganlari navbatda saqlanadi
 * - Server xatosi (4xx) → operatsiya tashlanadi (aks holda navbatni bloklaydi)
 */
export async function flush(): Promise<void> {
  if (isFlushing) return;

  const token = await getToken();
  if (!token) return; // login qilinmagan

  const net = await NetInfo.fetch();
  if (net.isConnected === false) return;

  isFlushing = true;
  try {
    let queue = await loadQueue();

    while (queue.length > 0) {
      const op = queue[0];
      try {
        await runOp(op);
        queue = queue.slice(1);
        await saveQueue(queue);
      } catch (e) {
        if (isNetworkError(e)) {
          // Offline — keyinroq davom etamiz
          break;
        }
        // Server rad etdi — bu operatsiyani tashlab ketamiz
        console.warn(`Sync: ${op.type} tashlandi —`, (e as Error)?.message);
        queue = queue.slice(1);
        await saveQueue(queue);
      }
    }
  } finally {
    isFlushing = false;
  }
}

async function runOp(op: SyncOp): Promise<void> {
  switch (op.type) {
    case "word.upsert":
      await apiSyncWords([op.payload]);
      return;
    case "word.delete":
      await apiDeleteWord(op.payload.clientId);
      return;
    case "quiz.save":
      await apiSyncQuizResults([op.payload]);
      return;
    case "profile.update":
      await apiUpdateProfile(op.payload);
      return;
  }
}

// ─── Avtomatik sinxronlash ────────────────────────────────────────────────────

let unsubscribeNet: (() => void) | null = null;

/** Ilova ochilganda chaqiriladi: internet paydo bo'lishi bilan navbat yuboriladi */
export function startAutoSync(): () => void {
  if (!unsubscribeNet) {
    unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        flush().catch(() => {});
      }
    });
  }

  flush().catch(() => {});

  return () => {
    unsubscribeNet?.();
    unsubscribeNet = null;
  };
}

/** Hozir internet bormi? */
export async function isOnline(): Promise<boolean> {
  const net = await NetInfo.fetch();
  return net.isConnected === true && net.isInternetReachable !== false;
}
