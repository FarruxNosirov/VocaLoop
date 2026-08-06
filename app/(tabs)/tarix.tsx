import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";
import { DayGroup, loadAllWordsByDay } from "@/services/storage";
import { speakWithGoogle } from "@/services/tts";
import { Word } from "@/types";

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
    "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
  ];
  if (dateStr === today) return `Bugun – ${day} ${months[date.getMonth()]}`;
  if (dateStr === yesterday) return `Kecha – ${day} ${months[date.getMonth()]}`;
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function TarixScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllWordsByDay()
      .then(setGroups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useCallback(() => {
    const query = search.toLowerCase().trim();
    return groups
      .map((g) => ({
        title: formatDateLabel(g.date),
        count: g.words.length,
        data: query
          ? g.words.filter(
              (w) =>
                w.original.toLowerCase().includes(query) ||
                w.translated.toLowerCase().includes(query),
            )
          : g.words,
      }))
      .filter((g) => g.data.length > 0);
  }, [groups, search]);

  async function speakWord(word: Word) {
    try {
      await speakWithGoogle({ text: word.original, language: "en-US", rate: 0.8 });
      await speakWithGoogle({ text: word.translated, language: "uz-UZ", rate: 0.8 });
    } catch (e) {
      console.error("TTS xatosi:", e);
    }
  }

  const sections = isLoading ? [] : filtered();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarix</Text>
        <Text style={styles.headerSub}>O'tgan kunlardagi so'zlar</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="So'z qidiring..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>{search ? "🔎" : "📭"}</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {search ? "Topilmadi" : "Hali tarix yo'q"}
          </Text>
          <Text style={styles.emptyText}>
            {search
              ? `"${search}" so'zi tarixda yo'q`
              : "Bugungi so'zlar shu yerda chiqadi"}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{section.title}</Text>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{section.count} ta</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.wordRow}
              onPress={() => speakWord(item)}
              activeOpacity={0.7}
            >
              <View style={styles.wordTexts}>
                <Text style={styles.wordOriginal}>{item.original}</Text>
                <Text style={styles.wordTranslated}>{item.translated}</Text>
              </View>
              <View style={styles.speakBtn}>
                <Text style={styles.speakBtnText}>▶</Text>
              </View>
            </TouchableOpacity>
          )}
          renderSectionFooter={() => <View style={{ height: 6 }} />}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    searchBox: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: 16, marginBottom: 8,
      borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    },
    searchIcon: { fontSize: 15 },
    searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
    clearBtn: { fontSize: 14, color: colors.textMuted, padding: 4 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyIconBox: {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: "center", justifyContent: "center", marginBottom: 4,
    },
    emptyIcon: { fontSize: 28 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    dayHeader: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 4, paddingTop: 14, paddingBottom: 8,
    },
    dayLabel: {
      fontSize: 12, fontWeight: "700", color: colors.textMuted,
      textTransform: "uppercase", letterSpacing: 0.6,
    },
    dayBadge: {
      backgroundColor: colors.primaryLight, borderRadius: 10,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    dayBadgeText: { fontSize: 11, fontWeight: "700", color: colors.primary },
    wordRow: {
      backgroundColor: colors.surface, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 14,
      flexDirection: "row", alignItems: "center", marginBottom: 6,
    },
    wordTexts: { flex: 1 },
    wordOriginal: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
    wordTranslated: { fontSize: 13, color: colors.primary, fontWeight: "500", marginTop: 2 },
    speakBtn: {
      backgroundColor: colors.success, width: 36, height: 36,
      borderRadius: 11, alignItems: "center", justifyContent: "center",
    },
    speakBtnText: { color: "#fff", fontSize: 12 },
  });
}
