import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";
import { Word } from "@/types";
import { WordCard } from "./word-card";

interface Props {
  words: Word[];
  isPlaying: boolean;
  onSpeakAll: () => void;
  onStop: () => void;
  onSpeak: (word: Word) => void;
  onDelete: (id: string) => void;
}

export function WordList({ words, isPlaying, onSpeakAll, onStop, onSpeak, onDelete }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <FlatList
      data={words}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bugungi so'zlar</Text>
            {words.length > 0 && (
              <Text style={styles.subtitle}>{words.length} ta so'z yozib olindi</Text>
            )}
          </View>
          {words.length > 0 && (
            <TouchableOpacity
              style={[styles.playBtn, isPlaying && styles.stopBtn]}
              onPress={isPlaying ? onStop : onSpeakAll}
              activeOpacity={0.8}
            >
              <Text style={styles.playBtnText}>
                {isPlaying ? "⏹ To'xtat" : "▶ Hammasini o'qi"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>✨</Text>
          </View>
          <Text style={styles.emptyTitle}>Bugun hali so'z yo'q</Text>
          <Text style={styles.emptyText}>
            Inglizcha so'z kiriting — tarjimasi{"\n"}va talaffuzi bilan saqlanadi
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <WordCard word={item} onSpeak={onSpeak} onDelete={onDelete} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    playBtn: {
      backgroundColor: colors.success,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    },
    stopBtn: { backgroundColor: colors.danger },
    playBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    emptyBox: {
      alignItems: "center", paddingVertical: 48, paddingHorizontal: 32,
    },
    emptyIconBox: {
      width: 72, height: 72, borderRadius: 24,
      backgroundColor: colors.primaryLight,
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    emptyIcon: { fontSize: 32 },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
    emptyText: { color: colors.textMuted, fontSize: 14, textAlign: "center", lineHeight: 22 },
    listContent: { paddingBottom: 32 },
  });
}
