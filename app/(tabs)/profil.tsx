import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";
import { ThemeMode, useTheme } from "@/context/theme-context";
import { ThemeColors } from "@/constants/app-colors";
import {
  getActiveDaysCount,
  getStreak,
  getTotalWordCount,
} from "@/services/storage";

interface Stats {
  totalWords: number;
  activeDays: number;
  streak: number;
}

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [stats, setStats] = useState<Stats>({ totalWords: 0, activeDays: 0, streak: 0 });
  const [themeSheet, setThemeSheet] = useState(false);

  useEffect(() => {
    Promise.all([getTotalWordCount(), getActiveDaysCount(), getStreak()])
      .then(([totalWords, activeDays, streak]) =>
        setStats({ totalWords, activeDays, streak })
      )
      .catch(console.error);
  }, []);

  function handleLogout() {
    Alert.alert("Chiqish", "Hisobdan chiqmoqchimisiz?", [
      { text: "Bekor", style: "cancel" },
      {
        text: "Chiqish",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const themeOptions: { key: ThemeMode; icon: string; label: string }[] = [
    { key: "light", icon: "☀️", label: "Light mode" },
    { key: "dark", icon: "🌙", label: "Dark mode" },
    { key: "system", icon: "📱", label: "System" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? "—"}</Text>
            <Text style={styles.userSub}>{user?.phone ?? "So'zlarni sinxronlash uchun kiring"}</Text>
          </View>
          <Text style={styles.chevronIcon}>›</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>So'zlar</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeDays}</Text>
            <Text style={styles.statLabel}>Kunlar</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {stats.streak}
            </Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
        </View>

        {/* Streak banner */}
        {stats.streak > 0 && (
          <View style={[styles.streakBanner, { backgroundColor: colors.warning }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>{stats.streak} kunlik streak!</Text>
              <Text style={styles.streakSub}>Har kuni o'qishda davom eting</Text>
            </View>
          </View>
        )}

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hisob</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="👤"
              iconBg={colors.primaryLight}
              label="Profilni tahrirlash"
              onPress={() => {}}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem
              icon="✉️"
              iconBg={colors.successLight}
              label="Email o'zgartirish"
              onPress={() => {}}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem
              icon="🚪"
              iconBg={colors.dangerLight}
              label="Chiqish"
              onPress={handleLogout}
              danger
              colors={colors}
            />
          </View>
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sozlamalar</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="🌙"
              iconBg={colors.primaryLight}
              label="Design theme"
              value={themeOptions.find((o) => o.key === theme)?.label}
              onPress={() => setThemeSheet(true)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuItem
              icon="🔔"
              iconBg={colors.warningLight}
              label="Daily Reminder"
              onPress={() => {}}
              colors={colors}
            />
          </View>
        </View>

        <Text style={styles.version}>VocaLoop v1.0</Text>
      </ScrollView>

      {/* Theme picker bottom sheet */}
      <Modal
        visible={themeSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setThemeSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setThemeSheet(false)}
        />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Choose theme
            </Text>
            <TouchableOpacity onPress={() => setThemeSheet(false)}>
              <View style={[styles.closeBtn, { backgroundColor: colors.border }]}>
                <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          {themeOptions.map((opt) => {
            const isSelected = theme === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeOption,
                  { borderColor: isSelected ? colors.primary : colors.border },
                  isSelected && { borderWidth: 2 },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setTheme(opt.key);
                  setThemeSheet(false);
                }}
              >
                <Text style={styles.themeOptionIcon}>{opt.icon}</Text>
                <Text style={[styles.themeOptionLabel, { color: colors.textPrimary }]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  iconBg,
  label,
  value,
  onPress,
  danger,
  colors,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[{ flex: 1, fontSize: 15, fontWeight: "600" }, { color: danger ? colors.danger : colors.textPrimary }]}>
        {label}
      </Text>
      {value && (
        <Text style={{ fontSize: 13, color: colors.textMuted, marginRight: 4 }}>{value}</Text>
      )}
      <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
    </TouchableOpacity>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
    headerTitle: {
      fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: -0.5,
    },
    userCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.surface, marginHorizontal: 16,
      borderRadius: 18, padding: 16,
    },
    avatar: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontWeight: "800", color: "#fff" },
    userInfo: { flex: 1, gap: 2 },
    userName: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
    userSub: { fontSize: 12, color: colors.textMuted },
    chevronIcon: { fontSize: 22, color: colors.textMuted },

    statsRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 10 },
    statCard: {
      flex: 1, backgroundColor: colors.surface,
      borderRadius: 16, paddingVertical: 16, alignItems: "center", gap: 4,
    },
    statValue: { fontSize: 26, fontWeight: "800", color: colors.primary },
    statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },

    streakBanner: {
      flexDirection: "row", alignItems: "center", gap: 14,
      marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14,
    },
    streakEmoji: { fontSize: 28 },
    streakTitle: { fontSize: 14, fontWeight: "800", color: "#fff" },
    streakSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 },

    section: { marginHorizontal: 16, marginTop: 22 },
    sectionTitle: {
      fontSize: 11, fontWeight: "700", color: colors.textMuted,
      textTransform: "uppercase", letterSpacing: 0.8,
      marginBottom: 8, marginLeft: 4,
    },
    menuCard: {
      backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden",
    },
    divider: { height: 1, marginLeft: 66 },

    version: {
      textAlign: "center", fontSize: 12,
      color: colors.textMuted, paddingVertical: 32,
    },

    // Bottom sheet
    sheetOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    sheetHandle: {
      width: 36, height: 4, borderRadius: 2,
      alignSelf: "center", marginBottom: 16,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    sheetTitle: { fontSize: 20, fontWeight: "800" },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16,
      alignItems: "center", justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, fontWeight: "600" },

    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      borderRadius: 16,
      borderWidth: 1,
      padding: 18,
      marginBottom: 12,
    },
    themeOptionIcon: { fontSize: 28 },
    themeOptionLabel: { flex: 1, fontSize: 17, fontWeight: "600" },
    checkCircle: {
      width: 28, height: 28, borderRadius: 14,
      alignItems: "center", justifyContent: "center",
    },
    checkMark: { color: "#fff", fontSize: 14, fontWeight: "800" },
  });
}
