import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NetInfo from "@react-native-community/netinfo";

import { ThemeColors } from "@/constants/app-colors";
import { useAuth } from "@/context/auth-context";
import { ThemeMode, useTheme } from "@/context/theme-context";
import { SERVER_ENABLED } from "@/services/config";
import { getPendingCount, onQueueChange } from "@/services/sync-queue";
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

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({
  visible,
  currentName,
  currentPhone,
  colors,
  onClose,
  onSave,
}: {
  visible: boolean;
  currentName: string;
  currentPhone: string;
  colors: ThemeColors;
  onClose: () => void;
  onSave: (name: string, phone: string) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setPhone(currentPhone);
    }
  }, [visible, currentName, currentPhone]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Xato", "Ism bo'sh bo'lishi mumkin emas");
      return;
    }
    if (SERVER_ENABLED && phone.trim().length < 4) {
      Alert.alert("Xato", "Telefon raqamni kiriting");
      return;
    }
    setLoading(true);
    try {
      await onSave(name.trim(), phone.trim());
      onClose();
    } catch (e: any) {
      Alert.alert("Xato", e?.message ?? "Saqlashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={onClose} />
        <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
          <View style={[ms.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={ms.header}>
            <Text style={[ms.title, { color: colors.textPrimary }]}>Profilni tahrirlash</Text>
            <TouchableOpacity
              style={[ms.closeBtn, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[ms.closeTxt, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar preview */}
          <View style={[ms.avatarPreview, { backgroundColor: colors.primary }]}>
            <Text style={ms.avatarText}>
              {name.trim()
                ? name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "?"}
            </Text>
          </View>

          {/* Name */}
          <Text style={[ms.label, { color: colors.textMuted }]}>Ism Familiya</Text>
          <TextInput
            style={[ms.input, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Ism Familiya"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Phone — faqat serverli rejimda */}
          {SERVER_ENABLED && (
            <>
              <Text style={[ms.label, { color: colors.textMuted, marginTop: 14 }]}>Telefon raqam</Text>
              <TextInput
                style={[ms.input, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+998 90 123 45 67"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </>
          )}

          {/* Save */}
          <TouchableOpacity
            style={[ms.saveBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={ms.saveTxt}>Saqlash</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 28 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Theme Modal ──────────────────────────────────────────────────────────────

function ThemeModal({
  visible, currentTheme, colors, onClose, onSelect,
}: {
  visible: boolean;
  currentTheme: ThemeMode;
  colors: ThemeColors;
  onClose: () => void;
  onSelect: (mode: ThemeMode) => void;
}) {
  const options: { key: ThemeMode; icon: string; label: string }[] = [
    { key: "light", icon: "☀️", label: "Light mode" },
    { key: "dark", icon: "🌙", label: "Dark mode" },
    { key: "system", icon: "📱", label: "System" },
  ];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
        <View style={[ms.handle, { backgroundColor: colors.border }]} />
        <View style={ms.header}>
          <Text style={[ms.title, { color: colors.textPrimary }]}>Theme tanlang</Text>
          <TouchableOpacity style={[ms.closeBtn, { backgroundColor: colors.border }]} onPress={onClose}>
            <Text style={[ms.closeTxt, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </View>
        {options.map((opt) => {
          const sel = currentTheme === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[ms.themeRow, { borderColor: sel ? colors.primary : colors.border }, sel && { borderWidth: 2 }]}
              activeOpacity={0.7}
              onPress={() => onSelect(opt.key)}
            >
              <Text style={{ fontSize: 26 }}>{opt.icon}</Text>
              <Text style={[{ flex: 1, fontSize: 16, fontWeight: "600" }, { color: colors.textPrimary }]}>
                {opt.label}
              </Text>
              {sel && (
                <View style={[ms.check, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 28 }} />
      </View>
    </Modal>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────

function DeleteAccountModal({
  visible, colors, onClose, onConfirm,
}: {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setPassword("");
  }, [visible]);

  async function handleDelete() {
    if (!password) {
      Alert.alert("Xato", "Tasdiqlash uchun parolingizni kiriting");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(password);
    } catch (e: any) {
      Alert.alert("Xato", e?.message ?? "Hisobni o'chirib bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={onClose} />
        <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
          <View style={[ms.handle, { backgroundColor: colors.border }]} />

          <View style={ms.header}>
            <Text style={[ms.title, { color: colors.danger }]}>{"Hisobni o'chirish"}</Text>
            <TouchableOpacity
              style={[ms.closeBtn, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[ms.closeTxt, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[ms.warning, { color: colors.textPrimary, backgroundColor: colors.dangerLight }]}>
            {"Hisobingiz, barcha so'zlaringiz va test natijalaringiz butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi."}
          </Text>

          <Text style={[ms.label, { color: colors.textMuted, marginTop: 16 }]}>Parol</Text>
          <TextInput
            style={[ms.input, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Parolingizni kiriting"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[ms.saveBtn, { backgroundColor: colors.danger }, loading && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={ms.saveTxt}>{"Butunlay o'chirish"}</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 28 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, colors }: { message: string; colors: ThemeColors }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[ms.toast, { backgroundColor: colors.surface, opacity }]}>
      <Text style={{ fontSize: 16 }}>✅</Text>
      <Text style={[ms.toastTxt, { color: colors.textPrimary }]}>{message}</Text>
    </Animated.View>
  );
}

// ─── Sinxronlash indikatori ───────────────────────────────────────────────────

function SyncBanner({ colors }: { colors: ThemeColors }) {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    getPendingCount().then(setPending);
    const unsub = onQueueChange(setPending);
    const netUnsub = NetInfo.addEventListener((st) =>
      setOnline(st.isConnected !== false)
    );
    return () => { unsub(); netUnsub(); };
  }, []);

  if (online && pending === 0) return null;

  const offline = !online;
  return (
    <View
      style={[
        ms.syncBanner,
        { backgroundColor: offline ? colors.warningLight : colors.primaryLight },
      ]}
    >
      <Text style={{ fontSize: 16 }}>{offline ? "📴" : "🔄"}</Text>
      <Text
        style={[
          ms.syncTxt,
          { color: offline ? colors.warning : colors.primary },
        ]}
      >
        {offline
          ? pending > 0
            ? `Internet yo'q — ${pending} ta o'zgarish saqlanmoqda`
            : "Internet yo'q — offline rejim"
          : `${pending} ta o'zgarish yuborilmoqda...`}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const router = useRouter();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [stats, setStats] = useState<Stats>({ totalWords: 0, activeDays: 0, streak: 0 });
  const [editSheet, setEditSheet] = useState(false);
  const [themeSheet, setThemeSheet] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [toastKey, setToastKey] = useState<number | null>(null);

  // Har safar Profil ekraniga qaytilganda statistika yangilanadi
  useFocusEffect(
    useCallback(() => {
      Promise.all([getTotalWordCount(), getActiveDaysCount(), getStreak()])
        .then(([totalWords, activeDays, streak]) => setStats({ totalWords, activeDays, streak }))
        .catch(console.error);
    }, [])
  );

  function showToast() {
    setToastKey(Date.now());
    setTimeout(() => setToastKey(null), 2500);
  }

  async function handleLogout() {
    const pendingCount = await getPendingCount();
    const message = pendingCount > 0
      ? `${pendingCount} ta o'zgarish hali serverga yuborilmagan va chiqsangiz yo'qoladi. Avval internetga ulaning.`
      : "Hisobdan chiqmoqchimisiz?";
    Alert.alert("Chiqish", message, [
      { text: "Bekor", style: "cancel" },
      {
        text: "Chiqish", style: "destructive",
        onPress: async () => { await logout(); router.replace("/(auth)/welcome"); },
      },
    ]);
  }

  function handleClearData() {
    Alert.alert(
      "Ma'lumotlarni tozalash",
      "Barcha so'zlaringiz va test natijalaringiz shu telefondan o'chiriladi. Bu amalni qaytarib bo'lmaydi.",
      [
        { text: "Bekor", style: "cancel" },
        {
          text: "O'chirish",
          style: "destructive",
          onPress: async () => {
            await deleteAccount("");
            setStats({ totalWords: 0, activeDays: 0, streak: 0 });
          },
        },
      ]
    );
  }

  async function handleDeleteAccount(password: string) {
    await deleteAccount(password);
    setDeleteSheet(false);
    router.replace("/(auth)/welcome");
  }

  const handleSaveProfile = useCallback(async (name: string, phone: string) => {
    await updateProfile({ name, email: phone });
    showToast();
  }, [updateProfile]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: "light", label: "Light mode" },
    { key: "dark", label: "Dark mode" },
    { key: "system", label: "System" },
  ];

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Profil</Text>
        </View>

        {/* User card */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.userInfo}>
            <Text style={s.userName}>{user?.name || "Ismingizni kiriting"}</Text>
            <Text style={s.userSub}>
              {SERVER_ENABLED
                ? user?.email || "So'zlarni sinxronlash uchun kiring"
                : "Ma'lumotlar shu telefonda saqlanadi"}
            </Text>
          </View>
        </View>

        {SERVER_ENABLED && <SyncBanner colors={colors} />}

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.totalWords}</Text>
            <Text style={s.statLabel}>So'zlar</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.activeDays}</Text>
            <Text style={s.statLabel}>Kunlar</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: colors.warning }]}>{stats.streak}</Text>
            <Text style={s.statLabel}>🔥 Streak</Text>
          </View>
        </View>

        {stats.streak > 0 && (
          <View style={[s.streakBanner, { backgroundColor: colors.warning }]}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.streakTitle}>{stats.streak} kunlik streak!</Text>
              <Text style={s.streakSub}>Har kuni o'qishda davom eting</Text>
            </View>
          </View>
        )}

        {/* Hisob */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Hisob</Text>
          <View style={s.menuCard}>
            <MenuItem icon="👤" iconBg={colors.primaryLight} label="Profilni tahrirlash"
              value={user?.name ?? undefined} onPress={() => setEditSheet(true)} colors={colors} />
            {SERVER_ENABLED && (
              <>
                <Divider color={colors.border} />
                <MenuItem icon="🚪" iconBg={colors.dangerLight} label="Chiqish"
                  onPress={handleLogout} danger colors={colors} />
              </>
            )}
            <Divider color={colors.border} />
            <MenuItem
              icon="🗑"
              iconBg={colors.dangerLight}
              label={SERVER_ENABLED ? "Hisobni o'chirish" : "Ma'lumotlarni tozalash"}
              onPress={SERVER_ENABLED ? () => setDeleteSheet(true) : handleClearData}
              danger
              colors={colors}
            />
          </View>
        </View>

        {/* Sozlamalar */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sozlamalar</Text>
          <View style={s.menuCard}>
            <MenuItem icon="🌙" iconBg={colors.primaryLight} label="Design theme"
              value={themeOptions.find((o) => o.key === theme)?.label}
              onPress={() => setThemeSheet(true)} colors={colors} />
            <Divider color={colors.border} />
            <MenuItem icon="🔒" iconBg={colors.successLight} label="Maxfiylik siyosati"
              onPress={() => router.push("/privacy")} colors={colors} />
          </View>
        </View>

        <Text style={s.version}>VocaLoop v1.0</Text>
      </ScrollView>

      <EditProfileModal
        visible={editSheet}
        currentName={user?.name ?? ""}
        currentPhone={user?.email ?? ""}
        colors={colors}
        onClose={() => setEditSheet(false)}
        onSave={handleSaveProfile}
      />

      <DeleteAccountModal
        visible={deleteSheet}
        colors={colors}
        onClose={() => setDeleteSheet(false)}
        onConfirm={handleDeleteAccount}
      />

      <ThemeModal
        visible={themeSheet}
        currentTheme={theme}
        colors={colors}
        onClose={() => setThemeSheet(false)}
        onSelect={(mode) => { setTheme(mode); setThemeSheet(false); }}
      />

      {toastKey !== null && (
        <Toast key={toastKey} message="Profil muvaffaqiyatli yangilandi" colors={colors} />
      )}
    </SafeAreaView>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Divider({ color }: { color: string }) {
  return <View style={{ height: 1, backgroundColor: color, marginLeft: 66 }} />;
}

function MenuItem({
  icon, iconBg, label, value, onPress, danger, colors,
}: {
  icon: string; iconBg: string; label: string; value?: string;
  onPress: () => void; danger?: boolean; colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
      onPress={onPress} activeOpacity={0.7}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: iconBg }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: danger ? colors.danger : colors.textPrimary }}>
        {label}
      </Text>
      {value && (
        <Text style={{ fontSize: 12, color: colors.textMuted, marginRight: 4, maxWidth: 130 }} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },

    userCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.surface, marginHorizontal: 16,
      borderRadius: 18, padding: 16,
    },
    avatar: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontWeight: "800", color: "#fff" },
    userInfo: { flex: 1, gap: 3 },
    userName: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
    userSub: { fontSize: 12, color: colors.textMuted },

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
    streakTitle: { fontSize: 14, fontWeight: "800", color: "#fff" },
    streakSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 },

    section: { marginHorizontal: 16, marginTop: 22 },
    sectionTitle: {
      fontSize: 11, fontWeight: "700", color: colors.textMuted,
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4,
    },
    menuCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" },

    version: { textAlign: "center", fontSize: 12, color: colors.textMuted, paddingVertical: 32 },
  });
}

// Modal uchun alohida static styles
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  closeTxt: { fontSize: 14, fontWeight: "600" },

  avatarPreview: {
    width: 64, height: 64, borderRadius: 20,
    alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#fff" },

  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },

  warning: { fontSize: 14, lineHeight: 20, padding: 14, borderRadius: 12, overflow: "hidden" },

  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  saveTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },

  themeRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10,
  },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  // Toast
  toast: {
    position: "absolute", top: 60, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 13,
    borderRadius: 32,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toastTxt: { fontSize: 15, fontWeight: "600" },

  // Sinxronlash banneri
  syncBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
  },
  syncTxt: { fontSize: 13, fontWeight: "600", flex: 1 },
});
