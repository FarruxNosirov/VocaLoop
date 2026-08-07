// Bepul Google Translate (API kalit shart emas, limit yo'q)
const FREE_URL = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t";

export async function translateWord(
  text: string,
  from = "en",
  to = "uz",
): Promise<string> {
  const url = `${FREE_URL}&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Tarjima xatosi: ${response.status}`);
  }

  const data = await response.json();

  // Javob formati: [[[["tarjima","asl",...]], ...], ...]
  const parts: string[] = data?.[0]?.map((chunk: any[]) => chunk?.[0] ?? "").filter(Boolean);
  const translated = parts?.join("").trim();

  if (!translated) {
    throw new Error("Tarjima qaytarilmadi");
  }

  return translated;
}
