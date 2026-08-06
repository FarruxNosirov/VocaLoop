import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";

import { ThemeColors } from "@/constants/app-colors";
import { BOOKS, BookWord } from "@/constants/books-data";
import { useTheme } from "@/context/theme-context";

export default function UnitScreen() {
  const { bookId, unitNum } = useLocalSearchParams<{
    bookId: string;
    unitNum: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const book = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0];
  const unit = book.units.find((u) => u.unit === Number(unitNum)) ?? book.units[0];

  function speak(item: BookWord) {
    Speech.stop();
    setSpeakingId(item.id);
    let textToSpeak = item.word;
    if (item.v2 && item.v3) {
      textToSpeak = `${item.word},,, ${item.v2},,, ${item.v3}`;
    }
    Speech.speak(textToSpeak, {
      language: "en-US",
      rate: 0.8,
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  }

  const renderWord = ({ item, index }: { item: BookWord; index: number }) => {
    return (
      <WordItem 
        item={item} 
        index={index} 
        isSpeaking={speakingId === item.id} 
        onSpeak={speak} 
        styles={styles} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Orqaga</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.unitTitle}>Unit {unit.unit}</Text>
          <Text style={styles.unitSubtitle}>{book.subtitle}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>📚 {unit.words.length} so'z</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>🔊 Talaffuzni eshiting</Text>
        </View>
      </View>

      <FlatList
        data={unit.words}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderWord}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const WordItem = ({ item, index, isSpeaking, onSpeak, styles }: any) => {
  const isIrregular = !!(item.v2 && item.v3);
  const [revealed, setRevealed] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={isIrregular && !revealed ? 0.7 : 1} 
      onPress={() => {
        if (isIrregular && !revealed) setRevealed(true);
      }}
    >
      <View style={styles.numBox}>
        <Text style={styles.numText}>{index + 1}</Text>
      </View>
      <View style={styles.cardLeft}>
        {isIrregular ? (
          <>
             <View style={styles.irregularRow}>
               <Text style={styles.wordText}>{item.word}</Text>
               {item.phonetic && <Text style={styles.phoneticText}>{item.phonetic}</Text>}
               {revealed ? (
                 <>
                   <Text style={styles.wordTextV2}> • {item.v2}</Text>
                   <Text style={styles.wordTextV3}> • {item.v3}</Text>
                 </>
               ) : (
                 <View style={styles.revealBox}>
                   <Text style={styles.revealHint}>Tap to reveal V2, V3</Text>
                 </View>
               )}
             </View>
             <Text style={styles.translationText}>{item.translation}</Text>
          </>
        ) : (
          <>
            <View style={styles.wordRow}>
              <Text style={styles.wordText}>{item.word}</Text>
              {item.phonetic && <Text style={styles.phoneticText}>{item.phonetic}</Text>}
            </View>
            <Text style={styles.translationText}>{item.translation}</Text>
          </>
        )}
      </View>
      <TouchableOpacity
        style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]}
        onPress={() => onSpeak(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.speakIcon}>{isSpeaking ? "🔈" : "🔊"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
    },
    backBtn: { width: 80 },
    backText: { fontSize: 16, color: colors.primary, fontWeight: "600" },
    headerCenter: { flex: 1, alignItems: "center" },
    unitTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    unitSubtitle: { fontSize: 12, color: colors.textMuted },
    headerRight: { width: 80 },

    statsRow: {
      flexDirection: "row", gap: 8,
      paddingHorizontal: 16, marginBottom: 12,
    },
    statChip: {
      backgroundColor: colors.primaryLight,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    },
    statChipText: { fontSize: 12, color: colors.primary, fontWeight: "600" },

    list: { paddingHorizontal: 16, paddingBottom: 32 },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      gap: 12,
    },
    numBox: {
      width: 32, height: 32, borderRadius: 10,
      backgroundColor: colors.primaryLight,
      alignItems: "center", justifyContent: "center",
    },
    numText: { fontSize: 13, fontWeight: "800", color: colors.primary },

    cardLeft: { flex: 1 },
    irregularRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 2 },
    wordRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", marginBottom: 2 },
    wordText: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
    phoneticText: { fontSize: 14, color: "#F59E0B", marginLeft: 8, fontStyle: "italic", fontWeight: "500" },
    wordTextV2: { fontSize: 15, fontWeight: "600", color: "#60A5FA" },
    wordTextV3: { fontSize: 15, fontWeight: "600", color: "#34D399" },
    translationText: { fontSize: 13, color: colors.primary, fontWeight: "500" },
    revealBox: { backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    revealHint: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },

    speakBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: colors.primaryLight,
      alignItems: "center", justifyContent: "center",
    },
    speakBtnActive: {
      backgroundColor: colors.primary,
    },
    speakIcon: { fontSize: 20 },
  });
}
