import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGetQuizResults, getToken } from "./api";
import { enqueue, enqueueMany } from "./sync-queue";

const KEY = "quiz_results_v1";

export interface QuizResult {
  correct: number;
  total: number;
  coins: number;
  completedAt: string;
}

type ResultsMap = Record<string, QuizResult>;

function resultKey(bookId: string, unitNum: number): string {
  return `${bookId}_${unitNum}`;
}

async function loadAll(): Promise<ResultsMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Natijani saqlash: avval lokal, keyin backendga (fon rejimda)
export async function saveQuizResult(
  bookId: string,
  unitNum: number,
  result: Omit<QuizResult, "completedAt">
): Promise<void> {
  const completedAt = new Date().toISOString();
  const map = await loadAll();
  map[resultKey(bookId, unitNum)] = { ...result, completedAt };
  await AsyncStorage.setItem(KEY, JSON.stringify(map));

  // Navbatga: online bo'lsa darhol, offline bo'lsa internet paydo bo'lganda ketadi
  await enqueue({
    type: "quiz.save",
    payload: { bookId, unitNum, completedAt, ...result },
  });
}

// Login bo'lganda backenddan yuklab, lokalni yangilash
export async function syncResultsFromBackend(): Promise<void> {
  try {
    const token = await getToken();
    if (!token) return;

    const serverResults = await apiGetQuizResults();
    if (!serverResults.length) return;

    const map = await loadAll();
    for (const r of serverResults) {
      const key = resultKey(r.bookId, r.unitNum);
      // Server natijasi yangroq bo'lsa yoki lokal yo'q bo'lsa — servernikini olamiz
      const local = map[key];
      if (!local || r.completedAt > local.completedAt) {
        map[key] = {
          correct: r.correct,
          total: r.total,
          coins: r.coins,
          completedAt: r.completedAt,
        };
      }
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // Offline — xato chiqarmaymiz
  }
}

// Lokal barcha natijalarni backendga yuborish (login paytida)
export async function pushLocalResultsToBackend(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const map = await loadAll();
  const entries = Object.entries(map);
  if (!entries.length) return;

  const ops = entries.map(([key, val]) => {
    // Kalit: "<bookId>_<unitNum>" — bookId da ham "_" bo'lishi mumkin (irregular-verbs)
    const sep = key.lastIndexOf("_");
    return {
      type: "quiz.save" as const,
      payload: {
        bookId: key.slice(0, sep),
        unitNum: parseInt(key.slice(sep + 1), 10),
        ...val,
      },
    };
  });

  await enqueueMany(ops);
}

export async function getBookResults(bookId: string): Promise<ResultsMap> {
  const map = await loadAll();
  const filtered: ResultsMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (k.startsWith(`${bookId}_`)) {
      filtered[k] = v;
    }
  }
  return filtered;
}

export function getUnitKey(bookId: string, unitNum: number): string {
  return resultKey(bookId, unitNum);
}
