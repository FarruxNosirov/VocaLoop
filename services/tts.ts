import { Audio } from "expo-av";
import * as Speech from "expo-speech";

// ─── Google Cloud TTS ───────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? "";
const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

// O'zbek tili uchun Google Translate TTS ishlatiladi (bepul, API kalit kerak emas)
const ELEVENLABS_LANGUAGES = ["uz"];

// Translate til kodi → Google Cloud TTS til kodi
const TTS_LANGUAGE_MAP: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  tr: "tr-TR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-BR",
  ar: "ar-XA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  hi: "hi-IN",
  bn: "bn-IN",
  nl: "nl-NL",
  pl: "pl-PL",
  sv: "sv-SE",
  el: "el-GR",
  cs: "cs-CZ",
  ro: "ro-RO",
  hu: "hu-HU",
  he: "he-IL",
  id: "id-ID",
  ms: "ms-MY",
  th: "th-TH",
  vi: "vi-VN",
  uk: "uk-UA",
  ka: "ka-GE",
};

interface TtsOptions {
  text: string;
  language: string; // "en", "uz", "ru" kabi qisqa kod
  rate?: number;
}

// ─── Google Translate TTS orqali o'qish (bepul, o'zbek tili uchun) ──────────
async function speakWithGoogleTranslateTTS(text: string, rate: number = 1.0): Promise<void> {
  const encoded = encodeURIComponent(text);
  const speed = rate <= 0.8 ? "0.24" : "1";
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=uz&client=gtx&ttsspeed=${speed}`;

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: false }
  );

  await sound.playAsync();

  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        resolve();
      }
    });
  });
}

// ─── Asosiy funksiya ────────────────────────────────────────────────────────
export async function speakWithGoogle({
  text,
  language,
  rate = 1.0,
}: TtsOptions): Promise<void> {
  // O'zbek tili → Google Translate TTS (bepul)
  if (ELEVENLABS_LANGUAGES.includes(language)) {
    try {
      return await speakWithGoogleTranslateTTS(text, rate);
    } catch (e) {
      console.error("Google Translate TTS xatosi, fallback ishlatiladi:", e);
      return fallbackSpeak(text, language, rate);
    }
  }

  // Boshqa tillar → Google Cloud TTS
  const ttsCode = TTS_LANGUAGE_MAP[language];

  if (!ttsCode) {
    return fallbackSpeak(text, language, rate);
  }

  const body = {
    input: { text },
    voice: { languageCode: ttsCode, ssmlGender: "FEMALE" },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: rate,
    },
  };

  try {
    const response = await fetch(GOOGLE_TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return fallbackSpeak(text, language, rate);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    const { sound } = await Audio.Sound.createAsync({
      uri: `data:audio/mp3;base64,${audioContent}`,
    });

    await sound.playAsync();

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
    });
  } catch {
    return fallbackSpeak(text, language, rate);
  }
}

function fallbackSpeak(text: string, language: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, { language, rate, onDone: resolve, onError: () => resolve() });
  });
}
