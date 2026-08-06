import AsyncStorage from "@react-native-async-storage/async-storage";

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
