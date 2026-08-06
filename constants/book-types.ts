export interface BookWord {
  id: string;
  word: string;
  phonetic?: string;
  translation: string;
  v2?: string;
  v3?: string;
}

export interface BookUnit {
  unit: number;
  title?: string;
  topic?: string;
  words: BookWord[];
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  totalUnits: number;
  units: BookUnit[];
}

export const createUnit = (
  num: number,
  words: [string, string, string][], // [word, phonetic, translation]
  title?: string,
  topic?: string
): BookUnit => ({
  unit: num,
  title,
  topic,
  words: words.map(([word, phonetic, translation], i) => ({
    id: `u${num}_${i + 1}`,
    word,
    phonetic,
    translation,
  })),
});

export const createIrregularUnit = (
  num: number,
  words: { v1: string; phonetic: string; v2: string; v3: string; uz: string }[],
  title?: string,
  topic?: string
): BookUnit => ({
  unit: num,
  title,
  topic,
  words: words.map((w, i) => ({
    id: `u${num}_${i + 1}`,
    word: w.v1,
    phonetic: w.phonetic,
    translation: w.uz,
    v2: w.v2,
    v3: w.v3,
  })),
});
