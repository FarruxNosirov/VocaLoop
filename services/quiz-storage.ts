import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function saveQuizResult(
  bookId: string,
  unitNum: number,
  result: Omit<QuizResult, "completedAt">
): Promise<void> {
  const map = await loadAll();
  map[resultKey(bookId, unitNum)] = {
    ...result,
    completedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
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
