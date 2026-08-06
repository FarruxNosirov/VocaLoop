import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveQuizResult } from "@/services/quiz-storage";

export default function QuizResultScreen() {
  const { bookId, unitNum, correct, total } = useLocalSearchParams<{
    bookId: string;
    unitNum: string;
    correct: string;
    total: string;
  }>();
  const router = useRouter();

  const c = Number(correct);
  const t = Number(total);
  const w = t - c;
  const pct = t > 0 ? Math.round((c / t) * 100) : 0;
  const coins = c;

  // Save result once when screen mounts
  useEffect(() => {
    saveQuizResult(bookId ?? "", Number(unitNum), { correct: c, total: t, coins });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Result — Unit {unitNum}</Text>
        <View style={styles.navBtn} />
      </View>

      {/* Score circle */}
      <View style={styles.scoreWrap}>
        <View style={[styles.scoreCircle, pct === 100 && styles.scoreCirclePerfect]}>
          <Text style={styles.scorePct}>{pct}%</Text>
          <Text style={styles.scoreLabel}>natija</Text>
        </View>
      </View>

      {/* Coins card */}
      <View style={styles.coinsCard}>
        <View style={styles.coinIconWrap}>
          <Text style={styles.coinSymbol}>$</Text>
        </View>
        <View>
          <Text style={styles.coinsLabel}>Coins Earned</Text>
          <Text style={styles.coinsValue}>+{coins}</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={styles.gridCell}>
          <Text style={styles.gridIcon}>❓</Text>
          <Text style={styles.gridBig}>{t}</Text>
          <Text style={styles.gridSub}>Total</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={[styles.gridIcon]}>✅</Text>
          <Text style={[styles.gridBig, { color: "#1DB954" }]}>{c}</Text>
          <Text style={styles.gridSub}>Correct</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.gridIcon}>❌</Text>
          <Text style={[styles.gridBig, { color: "#FF4757" }]}>{w}</Text>
          <Text style={styles.gridSub}>Wrong</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.gridIcon}>🏆</Text>
          <Text style={[styles.gridBig, { color: "#F59E0B" }]}>{coins}</Text>
          <Text style={styles.gridSub}>Coins</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.backBtnFull}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtnFull}
          activeOpacity={0.8}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.homeBtnText}>Home</Text>
        </TouchableOpacity>
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
    paddingVertical: 10,
    marginBottom: 4,
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

  scoreWrap: { alignItems: "center", marginVertical: 20 },
  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1F2E",
  },
  scoreCirclePerfect: { borderColor: "#1DB954" },
  scorePct: { fontSize: 34, fontWeight: "900", color: "#fff" },
  scoreLabel: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },

  coinsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#D97706",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  coinIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  coinSymbol: { fontSize: 26, fontWeight: "900", color: "#fff" },
  coinsLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  coinsValue: { fontSize: 30, fontWeight: "900", color: "#fff", marginTop: 2 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  gridCell: {
    width: "47%",
    backgroundColor: "#1C1F2E",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 2,
  },
  gridIcon: { fontSize: 22, marginBottom: 6 },
  gridBig: { fontSize: 30, fontWeight: "900", color: "#fff" },
  gridSub: { fontSize: 12, color: "#9CA3AF", fontWeight: "500", marginTop: 2 },

  btnRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtnFull: {
    flex: 1,
    backgroundColor: "#1C1F2E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  backBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  homeBtnFull: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  homeBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
