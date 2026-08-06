interface Suggestion {
  word: string;
  score: number;
}

export async function getSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(query.trim())}&max=6`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data: Suggestion[] = await response.json();
    return data.map((item) => item.word);
  } catch {
    return [];
  }
}
