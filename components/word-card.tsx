import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";
import { Word } from "@/types";

interface Props {
  word: Word;
  onSpeak: (word: Word) => void;
  onDelete: (id: string) => void;
}

export function WordCard({ word, onSpeak, onDelete }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.speakBtn}
        onPress={() => onSpeak(word)}
        activeOpacity={0.7}
      >
        <Text style={styles.speakBtnText}>▶</Text>
      </TouchableOpacity>
      <View style={styles.texts}>
        <Text style={styles.original}>{word.original}</Text>
        <Text style={styles.translated}>{word.translated}</Text>
      </View>
      <Text style={styles.time}>{word.time}</Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(word.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16, marginBottom: 8,
      borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    speakBtn: {
      backgroundColor: colors.success,
      width: 40, height: 40, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    speakBtnText: { color: "#fff", fontSize: 14 },
    texts: { flex: 1, gap: 2 },
    original: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
    translated: { fontSize: 14, color: colors.primary, fontWeight: "500" },
    time: { fontSize: 11, color: colors.textMuted },
    deleteBtn: {
      width: 32, height: 32, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
      backgroundColor: colors.background,
    },
    deleteBtnText: { color: colors.textMuted, fontSize: 12 },
  });
}
