import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeColors } from "@/constants/app-colors";
import { Book, BOOKS } from "@/constants/books-data";
import { useTheme } from "@/context/theme-context";
import {
  getBookResults,
  getUnitKey,
  QuizResult,
} from "@/services/quiz-storage";

export default function OyinlarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [results, setResults] = useState<Record<string, QuizResult>>({});

  useFocusEffect(
    useCallback(() => {
      if (selectedBook) {
        getBookResults(selectedBook.id).then(setResults);
      }
    }, [selectedBook])
  );

  const loadResults = useCallback((book: Book) => {
    setSelectedBook(book);
    getBookResults(book.id).then(setResults);
  }, []);

  // ── Unit ro'yxati ekrani ─────────────────────────────────────────────────
  if (selectedBook) {
    const doneCount = Object.keys(results).length;
    const totalCoins = Object.values(results).reduce((s, r) => s + r.coins, 0);

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            style={styles.navBtn}
          >
            <Text style={styles.navBtnText}>‹ Orqaga</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedBook.subtitle}</Text>
          <View style={styles.navBtn} />
        </View>

        {/* Progress strip */}
        <View style={styles.progressStrip}>
          <View style={styles.progressItem}>
            <Text style={styles.progressVal}>{doneCount}</Text>
            <Text style={styles.progressLbl}>Bajarildi</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Text style={styles.progressVal}>
              {selectedBook.totalUnits - doneCount}
            </Text>
            <Text style={styles.progressLbl}>Qolgan</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Text style={[styles.progressVal, { color: "#F59E0B" }]}>
              {totalCoins}
            </Text>
            <Text style={styles.progressLbl}>Coins 🏆</Text>
          </View>
        </View>

        <FlatList
          data={selectedBook.units}
          keyExtractor={(item) => String(item.unit)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const key = getUnitKey(selectedBook.id, item.unit);
            const res = results[key];
            const isDone = !!res;
            const isPerfect = isDone && res.correct === res.total;

            return (
              <TouchableOpacity
                style={[styles.unitRow, isDone && styles.unitRowDone]}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: selectedBook.id === "irregular-verbs" ? "/quiz/irregular" : "/quiz",
                    params: { bookId: selectedBook.id, unitNum: item.unit },
                  })
                }
              >
                {isDone && (
                  <View
                    style={[
                      styles.accentBar,
                      isPerfect ? styles.accentGreen : styles.accentBlue,
                    ]}
                  />
                )}

                <View
                  style={[
                    styles.unitNumBox,
                    isDone && (isPerfect ? styles.numBoxGreen : styles.numBoxBlue),
                  ]}
                >
                  {isDone ? (
                    <Text style={[styles.doneCheck, { color: isPerfect ? "#00C48C" : colors.primary }]}>✓</Text>
                  ) : (
                    <Text style={styles.unitNum}>{item.unit}</Text>
                  )}
                </View>

                <View style={styles.unitMeta}>
                  <Text style={styles.unitLabel}>Unit {item.unit}</Text>
                  <Text style={styles.unitWords}>
                    {item.words[0].word}, {item.words[1].word},{" "}
                    {item.words[2].word}...
                  </Text>
                </View>

                {isDone ? (
                  <View style={styles.doneRight}>
                    <Text
                      style={[
                        styles.scoreText,
                        { color: isPerfect ? "#00C48C" : colors.primary },
                      ]}
                    >
                      {res.correct}/{res.total}
                    </Text>
                    <View style={[styles.coinChip, { backgroundColor: colors.warningLight }]}>
                      <Text style={styles.coinChipText}>$ {res.coins}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
                    <Text style={styles.startBtnText}>Test</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // ── Kitob tanlash ekrani ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerMain}>
        <Text style={styles.title}>O'yinlar</Text>
        <Text style={styles.subtitle}>So'zlarni test orqali o'rganing</Text>
      </View>

      <View style={styles.gameTypeCard}>
        <Text style={styles.gameTypeIcon}>🎯</Text>
        <View style={styles.gameTypeInfo}>
          <Text style={styles.gameTypeName}>So'z testi</Text>
          <Text style={styles.gameTypeDesc}>
            Inglizcha so'zning to'g'ri tarjimasini toping
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kitob tanlang</Text>

      <FlatList
        data={BOOKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.7}
            onPress={() => loadResults(item)}
          >
            <Text style={styles.bookEmoji}>📘</Text>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookSub}>{item.subtitle}</Text>
              <Text style={styles.bookMeta}>
                {item.totalUnits} unit · {item.units.reduce((s, u) => s + u.words.length, 0)} so'z
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    headerMain: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    title: { fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
    },
    navBtn: { width: 80 },
    navBtnText: { fontSize: 16, color: colors.primary, fontWeight: "600" },
    headerTitle: {
      flex: 1, textAlign: "center",
      fontSize: 17, fontWeight: "700", color: colors.textPrimary,
    },

    progressStrip: {
      flexDirection: "row", marginHorizontal: 16, marginBottom: 14,
      backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 12,
    },
    progressItem: { flex: 1, alignItems: "center", gap: 2 },
    progressDivider: { width: 1, backgroundColor: colors.border },
    progressVal: { fontSize: 20, fontWeight: "800", color: colors.textPrimary },
    progressLbl: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },

    gameTypeCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      marginHorizontal: 16, marginBottom: 20,
      backgroundColor: colors.primaryLight, borderRadius: 16, padding: 16,
    },
    gameTypeIcon: { fontSize: 36 },
    gameTypeInfo: { flex: 1 },
    gameTypeName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    gameTypeDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 18 },

    sectionTitle: {
      fontSize: 16, fontWeight: "700", color: colors.textPrimary,
      paddingHorizontal: 20, marginBottom: 10,
    },

    list: { paddingHorizontal: 16, paddingBottom: 32 },

    bookCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10,
    },
    bookEmoji: { fontSize: 36 },
    bookInfo: { flex: 1 },
    bookTitle: { fontSize: 12, fontWeight: "600", color: colors.primary },
    bookSub: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginTop: 1 },
    bookMeta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
    chevron: { fontSize: 22, color: colors.textMuted },

    unitRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.surface, borderRadius: 14,
      padding: 12, marginBottom: 8, gap: 12, overflow: "hidden",
    },
    unitRowDone: { borderWidth: 1, borderColor: colors.border },
    accentBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
    accentBlue: { backgroundColor: colors.primary },
    accentGreen: { backgroundColor: "#00C48C" },

    unitNumBox: {
      width: 42, height: 42, borderRadius: 10,
      backgroundColor: colors.primaryLight,
      alignItems: "center", justifyContent: "center",
    },
    numBoxBlue: { backgroundColor: colors.primaryLight },
    numBoxGreen: { backgroundColor: colors.successLight },
    unitNum: { fontSize: 16, fontWeight: "800", color: colors.primary },
    doneCheck: { fontSize: 18, fontWeight: "800" },

    unitMeta: { flex: 1 },
    unitLabel: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
    unitWords: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    doneRight: { alignItems: "flex-end", gap: 4 },
    scoreText: { fontSize: 14, fontWeight: "800" },
    coinChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    coinChipText: { fontSize: 12, fontWeight: "700", color: "#F59E0B" },

    startBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
    startBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  });
}
