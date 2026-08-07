import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "@/components/language-picker";
import { TranslateInput } from "@/components/translate-input";
import { WordList } from "@/components/word-list";
import { Language, LANGUAGES } from "@/constants/languages";
import { useTheme } from "@/context/theme-context";
import { addWord, loadTodayWords, removeWord } from "@/services/storage";
import { translateWord } from "@/services/translate";
import { speakWithGoogle } from "@/services/tts";
import { Word } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayWords, setTodayWords] = useState<Word[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [fromLang, setFromLang] = useState<Language>(
    LANGUAGES.find((l) => l.code === "en")!,
  );
  const [toLang, setToLang] = useState<Language>(
    LANGUAGES.find((l) => l.code === "uz")!,
  );

  useEffect(() => {
    loadTodayWords()
      .then(setTodayWords)
      .catch((e) => console.error("Yuklashda xato:", e));
  }, []);

  async function handleTranslate(inputText: string) {
    setIsLoading(true);
    setTranslatedText("");
    try {
      const result = await translateWord(inputText, fromLang.code, toLang.code);
      setTranslatedText(result);

      const newWord: Word = {
        id: Date.now().toString(),
        original: inputText,
        translated: result,
        time: new Date().toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fromLangCode: fromLang.code,
        toLangCode: toLang.code,
      };

      // Lokal saqlash + backendga navbatga qo'yish
      const updated = await addWord(newWord);
      setTodayWords(updated);
    } catch {
      Alert.alert(
        "Xato",
        "Tarjima qilishda muammo yuz berdi. API kalitini tekshiring.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function speakWord(word: Word) {
    try {
      // so'z saqlangan paytdagi til kodlarini ishlatamiz (swap'dan keyin ham to'g'ri)
      const srcLang = word.fromLangCode ?? "en";
      const dstLang = word.toLangCode ?? "uz";
      await speakWithGoogle({
        text: word.original,
        language: srcLang,
        rate: 0.8,
      });
      await speakWithGoogle({
        text: word.translated,
        language: dstLang,
        rate: 0.8,
      });
    } catch (e) {
      console.error("TTS xatosi:", e);
    }
  }

  async function speakAllWords() {
    if (todayWords.length === 0) {
      Alert.alert(
        "So'z yo'q",
        "Bugun hali hech qanday so'z tarjima qilmadingiz.",
      );
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);

    for (const word of todayWords) {
      if (!isPlayingRef.current) break;
      try {
        const srcLang = word.fromLangCode ?? "en";
        const dstLang = word.toLangCode ?? "uz";
        await speakWithGoogle({
          text: word.original,
          language: srcLang,
          rate: 0.8,
        });
        if (!isPlayingRef.current) break;
        await speakWithGoogle({
          text: word.translated,
          language: dstLang,
          rate: 0.8,
        });
      } catch (e) {
        console.error("TTS xatosi:", e);
      }
      if (!isPlayingRef.current) break;
      await new Promise<void>((r) => setTimeout(r, 500));
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  }

  function stopSpeaking() {
    isPlayingRef.current = false;
    setIsPlaying(false);
  }

  async function deleteWord(id: string) {
    try {
      const updated = await removeWord(id);
      setTodayWords(updated);
    } catch (e) {
      console.error("O'chirishda xato:", e);
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: colors.primary }]}>VocaLoop</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            So&apos;z boyligingizni oshiring
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.historyBtn,
              { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => router.push("/(tabs)/tarix")}
            activeOpacity={0.7}
          >
            <Text style={[styles.historyBtnText, { color: colors.primary }]}>
              📅 Tarix
            </Text>
          </TouchableOpacity>
          {todayWords.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{todayWords.length}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.langRow}>
        <LanguagePicker
          selected={fromLang}
          onSelect={setFromLang}
          label="Dan"
        />
        <TouchableOpacity
          style={[styles.swapBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => {
            setFromLang(toLang);
            setToLang(fromLang);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.swapText, { color: colors.primary }]}>⇄</Text>
        </TouchableOpacity>
        <LanguagePicker selected={toLang} onSelect={setToLang} label="Ga" />
      </View>

      <TranslateInput
        onTranslate={handleTranslate}
        translatedText={translatedText}
        isLoading={isLoading}
      />

      <WordList
        words={todayWords}
        isPlaying={isPlaying}
        onSpeakAll={speakAllWords}
        onStop={stopSpeaking}
        onSpeak={speakWord}
        onDelete={deleteWord}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyBtn: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  historyBtnText: { fontSize: 13, fontWeight: "600" },
  logo: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  badge: {
    borderRadius: 14,
    minWidth: 42,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  badgeText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  swapText: { fontSize: 18, fontWeight: "700" },
});
