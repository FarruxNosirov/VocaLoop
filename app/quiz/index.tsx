import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BOOKS, BookWord } from "@/constants/books-data";

const TOTAL_TIME = 240;
const NEXT_DELAY = 900;
const LETTERS = ["A", "B", "C", "D"];
const LETTER_BG = ["#1E6F3E", "#7B6000", "#1A4F8C", "#7B1A1A"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Option = { text: string; isCorrect: boolean };

function getOptionText(w: BookWord): string {
  if (w.v2 && w.v3) {
    return `${w.v2}, ${w.v3} — ${w.translation}`;
  }
  return w.translation;
}

function buildOptions(allWords: BookWord[], current: BookWord): Option[] {
  const wrong = shuffle(allWords.filter((w) => w.id !== current.id))
    .slice(0, 3)
    .map((w) => ({ text: getOptionText(w), isCorrect: false }));
  return shuffle([...wrong, { text: getOptionText(current), isCorrect: true }]);
}

export default function QuizScreen() {
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

  const words = useMemo(() => shuffle(unit.words), [unit]);
  const [qIndex, setQIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  const correctRef = useRef(0);
  const qIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatingRef = useRef(false);

  const currentWord = words[qIndex];
  const options = useMemo(
    () => buildOptions(unit.words, currentWord),
    [currentWord, unit.words]
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
          total: String(words.length),
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

    if (options[idx].isCorrect) {
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
    }

    setTimeout(() => {
      const next = qIndexRef.current + 1;
      if (next >= words.length) {
        finishQuiz(correctRef.current);
      } else {
        qIndexRef.current = next;
        setQIndex(next);
        setChosen(null);
      }
    }, NEXT_DELAY);
  };

  const timerPct = timeLeft / TOTAL_TIME;
  const timerColor =
    timerPct > 0.5 ? "#4A90E2" : timerPct > 0.25 ? "#F5A623" : "#FF4757";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Time</Text>
        <View style={styles.navBtn} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>True Answer</Text>
          <Text style={styles.statValue}>{correctCount}</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBlue]}>
          <Text style={[styles.statLabel, { color: "#fff" }]}>Record</Text>
          <Text style={[styles.statValue, { color: "#fff" }]}>{words.length}</Text>
        </View>
      </View>

      <Text style={styles.questionCounter}>
        Question {qIndex + 1}/{words.length}
      </Text>

      {/* Word card */}
      <View style={styles.wordCard}>
        <View style={[styles.timerCircle, { borderColor: timerColor }]}>
          <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
        </View>
        <Text style={styles.wordText}>{currentWord.word}</Text>
      </View>

      {/* Options */}
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
              <Text style={styles.optionText} numberOfLines={2}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1117" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navBtn: { width: 44 },
  navIcon: { fontSize: 28, color: "#fff", fontWeight: "300" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1C1F2E",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statBoxBlue: { backgroundColor: "#2563EB" },
  statLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#fff" },

  questionCounter: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },

  wordCard: {
    marginHorizontal: 16,
    backgroundColor: "#1C1F2E",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  timerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  timerNum: { fontSize: 20, fontWeight: "800" },
  wordText: { fontSize: 28, fontWeight: "800", color: "#fff" },

  optionsWrap: { paddingHorizontal: 16, gap: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1F2E",
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  letterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  optionText: { flex: 1, fontSize: 15, color: "#E5E7EB", fontWeight: "500" },
});
