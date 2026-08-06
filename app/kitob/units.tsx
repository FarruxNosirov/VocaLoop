import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
import { BOOKS } from "@/constants/books-data";
import { useTheme } from "@/context/theme-context";
import { getBookResults, getUnitKey, QuizResult } from "@/services/quiz-storage";

export default function UnitsScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const book = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0];
  const [results, setResults] = useState<Record<string, QuizResult>>({});

  useFocusEffect(
    useCallback(() => {
      getBookResults(book.id).then(setResults);
    }, [book.id])
  );

  const totalCoins = Object.values(results).reduce((s, r) => s + r.coins, 0);
  const doneCount = Object.keys(results).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Orqaga</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{book.subtitle}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{book.title}</Text>
        </View>
        <View style={styles.dirBadge}>
          <Text style={styles.dirText}>EN → UZ</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>📚 {doneCount}/{book.totalUnits} bajarildi</Text>
        </View>
        {totalCoins > 0 && (
          <View style={[styles.statChip, styles.coinChip]}>
            <Text style={[styles.statChipText, styles.coinChipText]}>🏆 {totalCoins} $</Text>
          </View>
        )}
      </View>

      <FlatList
        data={book.units}
        keyExtractor={(item) => String(item.unit)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const key = getUnitKey(book.id, item.unit);
          const res = results[key];
          const isDone = !!res;
          const isPerfect = isDone && res.correct === res.total;

          return (
            <TouchableOpacity
              style={[styles.unitRow, isDone && styles.unitRowDone]}
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/kitob/unit",
                  params: { bookId: book.id, unitNum: item.unit },
                })
              }
            >
              {isDone && (
                <View style={[styles.accent, isPerfect && styles.accentPerfect]} />
              )}

              <Text style={styles.unitLabel}>Unit {item.unit}</Text>

              <View style={styles.unitRight}>
                {isDone ? (
                  <>
                    <Text style={[styles.scoreText, isPerfect && styles.scoreTextPerfect]}>
                      {res.correct}/{res.total}
                    </Text>
                    <View style={styles.coinBadge}>
                      <Text style={styles.coinBadgeIcon}>$</Text>
                      <Text style={styles.coinBadgeVal}>{res.coins}</Text>
                    </View>
                  </>
                ) : null}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 12,
      gap: 8,
    },
    backBtn: { width: 80 },
    backText: { fontSize: 16, color: colors.primary, fontWeight: "600" },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
    headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    dirBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 6,
    },
    dirText: { fontSize: 12, fontWeight: "700", color: colors.primary },

    statsRow: {
      flexDirection: "row", gap: 8,
      paddingHorizontal: 16, marginBottom: 12,
    },
    statChip: {
      backgroundColor: colors.surface,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    },
    statChipText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    coinChip: { backgroundColor: colors.warningLight },
    coinChipText: { color: colors.warning },

    list: { paddingHorizontal: 16, paddingBottom: 32 },

    unitRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 16, paddingHorizontal: 16,
      marginBottom: 8, overflow: "hidden",
    },
    unitRowDone: {
      borderWidth: 1, borderColor: colors.border,
    },
    accent: {
      position: "absolute", left: 0, top: 0, bottom: 0,
      width: 3, backgroundColor: colors.primary,
      borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    },
    accentPerfect: { backgroundColor: colors.success },

    unitLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.textPrimary },

    unitRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    scoreText: { fontSize: 14, fontWeight: "700", color: colors.primary },
    scoreTextPerfect: { color: colors.success },
    coinBadge: {
      flexDirection: "row", alignItems: "center", gap: 3,
      backgroundColor: colors.warningLight,
      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    },
    coinBadgeIcon: { fontSize: 12, color: colors.warning, fontWeight: "800" },
    coinBadgeVal: { fontSize: 13, fontWeight: "800", color: colors.warning },
    chevron: {
      fontSize: 22, color: colors.textMuted,
      fontWeight: "300", marginLeft: 4,
    },
  });
}
