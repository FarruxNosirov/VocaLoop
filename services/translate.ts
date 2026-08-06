const API_KEY = "AIzaSyCPO68uUuFgnh1xYj1A3FWBHYYHpLmfZN4";

export async function translateWord(
  text: string,
  from = "en",
  to = "uz",
): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: "text",
    }),
  });

  if (!response.ok) {
    throw new Error(`Tarjima xatosi: ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.data?.translations?.[0]?.translatedText;

  if (!translated) {
    throw new Error("Tarjima qaytarilmadi");
  }

  return translated;
}
