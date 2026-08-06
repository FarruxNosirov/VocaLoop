import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BOOKS, BookWord } from "@/constants/books-data";

const TOTAL_TIME = 300;
const NEXT_DELAY = 600;
const LETTERS = ["A", "B", "C", "D"];
const LETTER_BG = ["#1E6F3E", "#7B6000", "#1A4F8C", "#7B1A1A"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Option = { text: string; isCorrect: boolean };

function generateFakeEd(word: string) {
  if (word.endsWith("e")) return word + "d";
  if (word.endsWith("y")) return word.slice(0, -1) + "ied";
  return word + "ed";
}

function buildIrregularOptions(
  allWords: BookWord[],
  current: BookWord,
  step: "v2" | "v3",
  prevCorrectIdx: number | null
): Option[] {
  const correctAnswer = step === "v2" ? current.v2! : current.v3!;
  
  const distractors = new Set<string>();
  
  // 1. The other form
  const otherForm = step === "v2" ? current.v3! : current.v2!;
  if (otherForm !== correctAnswer) distractors.add(otherForm);
  
  // 2. Fake 'ed'
  const fakeEd = generateFakeEd(current.word);
  if (fakeEd !== correctAnswer) distractors.add(fakeEd);
  
  // 3. Random other verbs' forms
  const otherWords = shuffle(allWords.filter((w) => w.id !== current.id));
  for (const w of otherWords) {
    if (distractors.size >= 3) break;
    if (w.v2 && w.v2 !== correctAnswer) distractors.add(w.v2);
    if (w.v3 && w.v3 !== correctAnswer) distractors.add(w.v3);
  }
  
  const wrongOptions = Array.from(distractors).slice(0, 3).map(text => ({ text, isCorrect: false }));
  let newOptions = shuffle([...wrongOptions, { text: correctAnswer, isCorrect: true }]);

  // Force correct answer to a different slot if it's the exact same text and happened to land in the same slot
  if (step === "v3" && prevCorrectIdx !== null && current.v2 === current.v3) {
    const currentCorrectIdx = newOptions.findIndex(o => o.isCorrect);
    if (currentCorrectIdx === prevCorrectIdx) {
      // Swap with another random index
      const swapIdx = (currentCorrectIdx + 1 + Math.floor(Math.random() * 3)) % 4;
      const temp = newOptions[currentCorrectIdx];
      newOptions[currentCorrectIdx] = newOptions[swapIdx];
      newOptions[swapIdx] = temp;
    }
  }

  return newOptions;
}

export default function IrregularQuizScreen() {
  const { bookId, unitNum } = useLocalSearchParams<{
    bookId: string;
    unitNum: string;
  }>();
  const router = useRouter();

  const book = useMemo(() => BOOKS.find((b) => b.id === bookId) ?? BOOKS[0], [bookId]);
  const unit = useMemo(
    () => book.units.find((u) => u.unit === Number(unitNum)) ?? book.units[0],
    [book, unitNum]
  );

  const words = useMemo(() => shuffle(unit.words.filter(w => w.v2 && w.v3)), [unit]);
  
  const [qIndex, setQIndex] = useState(0);
  const [step, setStep] = useState<"v2" | "v3">("v2");
  const [chosen, setChosen] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  
  // Track success of the current word
  const [v2Answer, setV2Answer] = useState<string | null>(null);

  const correctRef = useRef(0);
  const qIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatingRef = useRef(false);
  const prevCorrectIdxRef = useRef<number | null>(null);

  const currentWord = words[qIndex];
  
  const options = useMemo(
    () => buildIrregularOptions(unit.words, currentWord, step, prevCorrectIdxRef.current),
    [currentWord, unit.words, step]
  );

  const finishQuiz = useCallback(
    (finalCorrect: number) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace({
        pathname: "/quiz/result",
        params: {
          bookId: book.id,
          unitNum: String(unit.unit),
          correct: String(finalCorrect),
          total: String(words.length * 2), // Total is words * 2 because 2 steps per word
        },
      });
    },
    [book.id, unit.unit, words.length, router]
  );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishQuiz(correctRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finishQuiz]);

  const handleSelect = (idx: number) => {
    if (chosen !== null || navigatingRef.current) return;
    setChosen(idx);

    const isCorrect = options[idx].isCorrect;
    if (isCorrect) {
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
    }

    setTimeout(() => {
      if (step === "v2") {
        setV2Answer(options[idx].text);
        if (isCorrect) {
           prevCorrectIdxRef.current = idx;
        } else {
           // If they were wrong, we still know the correct index
           prevCorrectIdxRef.current = options.findIndex(o => o.isCorrect);
        }
        setStep("v3");
        setChosen(null);
      } else {
        const next = qIndexRef.current + 1;
        if (next >= words.length) {
          finishQuiz(correctRef.current);
        } else {
          qIndexRef.current = next;
          setQIndex(next);
          setStep("v2");
          setV2Answer(null);
          setChosen(null);
          prevCorrectIdxRef.current = null;
        }
      }
    }, NEXT_DELAY);
  };

  const timerPct = timeLeft / TOTAL_TIME;
  const timerColor =
    timerPct > 0.5 ? "#4A90E2" : timerPct > 0.25 ? "#F5A623" : "#FF4757";

  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Irregular Verbs</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>True Answers</Text>
            <Text style={styles.statValue}>{correctCount}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Text style={[styles.statLabel, { color: "#fff" }]}>Record</Text>
            <Text style={[styles.statValue, { color: "#fff" }]}>{words.length * 2}</Text>
          </View>
        </View>

        <Text style={styles.questionCounter}>
          Word {qIndex + 1}/{words.length} • Step {step === "v2" ? 1 : 2}/2
        </Text>

        <View style={styles.wordCard}>
          <View style={[styles.timerCircle, { borderColor: timerColor }]}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
          </View>
          
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{currentWord.translation}</Text>
          </View>
          
          <View style={styles.verbRow}>
            <Text style={styles.verbBase}>{currentWord.word}</Text>
            <Text style={styles.verbArrow}>→</Text>
            
            <View style={[styles.verbSlot, step === "v2" && styles.verbSlotActive]}>
               <Text style={[styles.verbSlotText, v2Answer && { color: "#fff" }]}>
                  {v2Answer ? v2Answer : (step === "v2" ? "?" : "")}
               </Text>
            </View>
            
            <Text style={styles.verbArrow}>→</Text>
            
            <View style={[styles.verbSlot, step === "v3" && styles.verbSlotActive]}>
               <Text style={styles.verbSlotText}>
                  {step === "v3" ? "?" : ""}
               </Text>
            </View>
          </View>
          
          <Text style={styles.instructionText}>
            {step === "v2" ? "Select the Past Simple (V2)" : "Select the Past Participle (V3)"}
          </Text>
        </View>

        <View style={styles.optionsWrap}>
          {options.map((opt, idx) => {
            const isChosen = chosen === idx;
            const isReveal = chosen !== null;
            let rowBg = styles.optionRow;
            let letterBg = { backgroundColor: LETTER_BG[idx] };

            if (isReveal) {
              if (opt.isCorrect) {
                rowBg = { ...styles.optionRow, backgroundColor: "#0D3B26" } as any;
                letterBg = { backgroundColor: "#1DB954" };
              } else if (isChosen) {
                rowBg = { ...styles.optionRow, backgroundColor: "#3B0D0D" } as any;
                letterBg = { backgroundColor: "#FF4757" };
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={rowBg}
                activeOpacity={0.75}
                onPress={() => handleSelect(idx)}
                disabled={chosen !== null}
              >
                <View style={[styles.letterCircle, letterBg]}>
                  <Text style={styles.letterText}>{LETTERS[idx]}</Text>
                </View>
                <Text style={styles.optionText} numberOfLines={1}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1117" },
  scrollContent: { paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  navBtn: { width: 44 },
  navIcon: { fontSize: 32, color: "#fff", fontWeight: "300" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginTop: 4, marginBottom: 10 },
  statBox: { flex: 1, backgroundColor: "#1C1F2E", borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 4 },
  statBoxBlue: { backgroundColor: "#2563EB" },
  statLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  statValue: { fontSize: 24, fontWeight: "800", color: "#fff" },
  questionCounter: { textAlign: "center", fontSize: 14, color: "#9CA3AF", marginBottom: 12, fontWeight: "600" },
  wordCard: {
    marginHorizontal: 16, backgroundColor: "#1C1F2E", borderRadius: 24, paddingVertical: 24, paddingHorizontal: 16, alignItems: "center", gap: 16, marginBottom: 16,
  },
  timerCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  timerNum: { fontSize: 18, fontWeight: "800" },
  translationBox: { backgroundColor: "#374151", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  translationText: { color: "#E5E7EB", fontSize: 15, fontWeight: "600" },
  verbRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  verbBase: { color: "#fff", fontSize: 24, fontWeight: "700" },
  verbArrow: { color: "#6B7280", fontSize: 22, fontWeight: "700" },
  verbSlot: { backgroundColor: "#1F2937", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, minWidth: 90, alignItems: "center", borderWidth: 2, borderColor: "#374151" },
  verbSlotActive: { borderColor: "#3B82F6", backgroundColor: "#1E3A8A" },
  verbSlotText: { color: "#9CA3AF", fontSize: 20, fontWeight: "700" },
  instructionText: { color: "#60A5FA", fontSize: 16, fontWeight: "600", marginTop: 8 },
  optionsWrap: { paddingHorizontal: 16, gap: 12 },
  optionRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1F2E", borderRadius: 16, padding: 16, gap: 14 },
  letterCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  letterText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  optionText: { flex: 1, fontSize: 18, color: "#E5E7EB", fontWeight: "700", textAlign: "center" },
});
