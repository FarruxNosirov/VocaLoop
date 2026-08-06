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
import { BOOKS, Book } from "@/constants/books-data";
import { useTheme } from "@/context/theme-context";
import { getBookResults, QuizResult } from "@/services/quiz-storage";

export default function KitoblarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [allResults, setAllResults] = useState<Record<string, Record<string, QuizResult>>>({});

  useFocusEffect(
    useCallback(() => {
      Promise.all(BOOKS.map((b) => getBookResults(b.id).then((r) => ({ id: b.id, r })))).then(
        (arr) => {
          const map: Record<string, Record<string, QuizResult>> = {};
          arr.forEach(({ id, r }) => { map[id] = r; });
          setAllResults(map);
        }
      );
    }, [])
  );

  const renderBook = ({ item }: { item: Book }) => {
    const results = allResults[item.id] ?? {};
    const doneCount = Object.keys(results).length;
    const totalCoins = Object.values(results).reduce((s, r) => s + r.coins, 0);
    const progress = item.totalUnits > 0 ? doneCount / item.totalUnits : 0;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        activeOpacity={0.75}
        onPress={() =>
          router.push({ pathname: "/kitob/units", params: { bookId: item.id } })
        }
      >
        <View style={styles.bookIconBox}>
          <Text style={styles.bookIcon}>📗</Text>
        </View>

        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookSubtitle}>{item.subtitle}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{doneCount}/{item.totalUnits}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>EN → UZ</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>📚 {item.totalUnits} unit</Text>
            </View>
            {totalCoins > 0 && (
              <View style={[styles.metaBadge, styles.coinBadge]}>
                <Text style={styles.coinText}>🏆 {totalCoins} $</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kitoblar</Text>
        <Text style={styles.headerSub}>{BOOKS.length} ta kitob mavjud</Text>
      </View>

      <FlatList
        data={BOOKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderBook}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 26, fontWeight: "800",
      color: colors.textPrimary, letterSpacing: -0.5,
    },
    headerSub: {
      fontSize: 13, color: colors.textMuted, marginTop: 2,
    },

    list: { paddingHorizontal: 16, paddingBottom: 32 },

    bookCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      gap: 14,
    },
    bookIconBox: {
      width: 60, height: 70,
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    bookIcon: { fontSize: 32 },

    bookInfo: { flex: 1, gap: 6 },
    bookTitle: {
      fontSize: 14, fontWeight: "800",
      color: colors.textPrimary, lineHeight: 20,
    },
    bookSubtitle: {
      fontSize: 12, color: colors.primary, fontWeight: "600",
    },

    progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    progressTrack: {
      flex: 1, height: 5, borderRadius: 3,
      backgroundColor: colors.border, overflow: "hidden",
    },
    progressFill: {
      height: "100%", backgroundColor: colors.primary, borderRadius: 3,
    },
    progressLabel: {
      fontSize: 11, color: colors.textMuted, fontWeight: "600", minWidth: 36,
    },

    metaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    metaBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3,
    },
    metaText: { fontSize: 11, color: colors.primary, fontWeight: "700" },
    coinBadge: { backgroundColor: colors.warningLight },
    coinText: { fontSize: 11, color: colors.warning, fontWeight: "700" },

    chevron: {
      fontSize: 24, color: colors.textMuted,
      fontWeight: "300",
    },
  });
}
