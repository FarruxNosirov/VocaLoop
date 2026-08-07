import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiGetWords, getToken } from "./api";
import { enqueue, enqueueMany } from "./sync-queue";
import { Word } from "@/types";

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function loadTodayWords(): Promise<Word[]> {
  const stored = await AsyncStorage.getItem(getTodayKey());
  return stored ? (JSON.parse(stored) as Word[]) : [];
}

export async function saveWords(words: Word[]): Promise<void> {
  await AsyncStorage.setItem(getTodayKey(), JSON.stringify(words));
}

// ─── Backend bilan sinxronlanadigan amallar ──────────────────────────────────

/** So'z qo'shish: lokal saqlanadi + backendga navbatga qo'yiladi */
export async function addWord(word: Word): Promise<Word[]> {
  const today = await loadTodayWords();
  const updated = [word, ...today];
  await saveWords(updated);

  await enqueue({
    type: "word.upsert",
    payload: {
      clientId: word.id,
      original: word.original,
      translated: word.translated,
      time: word.time,
      date: getTodayKey(),
      fromLangCode: word.fromLangCode,
      toLangCode: word.toLangCode,
    },
  });

  return updated;
}

/** So'z o'chirish: lokaldan olib tashlanadi + backendga navbatga qo'yiladi */
export async function removeWord(id: string): Promise<Word[]> {
  const today = await loadTodayWords();
  const updated = today.filter((w) => w.id !== id);
  await saveWords(updated);

  await enqueue({ type: "word.delete", payload: { clientId: id } });

  return updated;
}

/** Backenddan barcha so'zlarni yuklab, lokal bilan birlashtirish */
export async function syncWordsFromBackend(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  try {
    const serverWords = await apiGetWords();
    if (!serverWords.length) return;

    // Sana bo'yicha guruhlash
    const byDate = new Map<string, Word[]>();
    for (const sw of serverWords) {
      const list = byDate.get(sw.date) ?? [];
      list.push({
        id: sw.clientId,
        original: sw.original,
        translated: sw.translated,
        time: sw.time,
        fromLangCode: sw.fromLangCode,
        toLangCode: sw.toLangCode,
      });
      byDate.set(sw.date, list);
    }

    // Har bir kun uchun lokal bilan birlashtirish (id bo'yicha takrorlanmaydi)
    for (const [date, serverList] of byDate) {
      const raw = await AsyncStorage.getItem(date);
      const localList: Word[] = raw ? JSON.parse(raw) : [];

      const merged = [...localList];
      const seen = new Set(localList.map((w) => w.id));
      for (const w of serverList) {
        if (!seen.has(w.id)) merged.push(w);
      }

      await AsyncStorage.setItem(date, JSON.stringify(merged));
    }
  } catch {
    // Offline — jim o'tamiz, keyingi ulanishda qayta uriniladi
  }
}

/** Lokaldagi barcha so'zlarni backendga yuborish (login paytida) */
export async function pushLocalWordsToBackend(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const groups = await loadAllWordsByDay();
  const ops = groups.flatMap((g) =>
    g.words.map((w) => ({
      type: "word.upsert" as const,
      payload: {
        clientId: w.id,
        original: w.original,
        translated: w.translated,
        time: w.time,
        date: g.date,
        fromLangCode: w.fromLangCode,
        toLangCode: w.toLangCode,
      },
    }))
  );

  await enqueueMany(ops);
}

// Barcha kunlardagi so'zlarni sana bo'yicha guruhlangan holda qaytaradi
export interface DayGroup {
  date: string;   // "2026-04-01"
  words: Word[];
}

export async function loadAllWordsByDay(): Promise<DayGroup[]> {
  const allKeys = await AsyncStorage.getAllKeys();

  // Faqat sana formatidagi kalitlarni olish: "YYYY-MM-DD"
  const dateKeys = allKeys
    .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .sort((a, b) => b.localeCompare(a)); // yangi sanalar birinchi

  if (dateKeys.length === 0) return [];

  const pairs = await AsyncStorage.multiGet(dateKeys);

  return pairs
    .map(([date, value]) => ({
      date,
      words: value ? (JSON.parse(value) as Word[]) : [],
    }))
    .filter((g) => g.words.length > 0);
}

// Jami so'zlar soni
export async function getTotalWordCount(): Promise<number> {
  const groups = await loadAllWordsByDay();
  return groups.reduce((sum, g) => sum + g.words.length, 0);
}

// Necha kun so'z yozilgan
export async function getActiveDaysCount(): Promise<number> {
  const groups = await loadAllWordsByDay();
  return groups.length;
}

// Streak — ketma-ket kunlar soni
export async function getStreak(): Promise<number> {
  const groups = await loadAllWordsByDay();
  if (groups.length === 0) return 0;

  const today = getTodayKey();
  const dates = new Set(groups.map((g) => g.date));

  let streak = 0;
  let current = today;

  while (dates.has(current)) {
    streak++;
    const d = new Date(current);
    d.setDate(d.getDate() - 1);
    current = d.toISOString().split("T")[0];
  }

  return streak;
}
