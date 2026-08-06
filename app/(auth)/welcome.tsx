import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppColors } from "@/constants/app-colors";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>📚</Text>
        </View>
        <Text style={styles.appName}>VocaLoop</Text>
        <Text style={styles.tagline}>
          Ingliz so'zlarini o'zbek tilida{"\n"}o'rganing — har kun yangi so'zlar
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow emoji="🔤" text="Inglizcha → O'zbekcha tarjima" />
          <FeatureRow emoji="🔊" text="Ovozli talaffuz" />
          <FeatureRow emoji="📅" text="Kunlik so'zlar tarixi" />
          <FeatureRow emoji="🔥" text="Streak va statistika" />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Boshlash →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Hisobim bor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: AppColors.primaryMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  features: {
    width: "100%",
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  btnSecondaryText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "600",
  },
});
