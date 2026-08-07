import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppColors } from "@/constants/app-colors";
import { useAuth } from "@/context/auth-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (phone.trim().length < 13) {
      Alert.alert("Xato", "Telefon raqamni to'liq kiriting");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Xato", "Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(phone.trim(), password);
      if (!success) {
        Alert.alert("Kirish xatosi", "Telefon yoki parol noto'g'ri");
      }
    } catch (e: any) {
      Alert.alert("Xato", e?.message ?? "Kirishda muammo yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Xush kelibsiz 👋</Text>
            <Text style={styles.subtitle}>Hisobingizga kiring</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon raqam</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+998 90 123 45 67"
                placeholderTextColor={AppColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { paddingRight: 52 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Parolni kiriting"
                  placeholderTextColor={AppColors.textMuted}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Kirish</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hisobingiz yo'qmi? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
              <Text style={styles.footerLink}>Ro'yxatdan o'ting</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flexGrow: 1 },
  header: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    marginBottom: 16,
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  backText: { fontSize: 20, color: "#fff" },
  title: { fontSize: 26, fontWeight: "800", color: AppColors.primaryLight },
  subtitle: { fontSize: 14, color: AppColors.primaryMuted, marginTop: 4 },
  form: { padding: 24, gap: 16 },
  inputGroup: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: "700", color: AppColors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: AppColors.textPrimary,
    borderWidth: 1, borderColor: AppColors.border,
  },
  passwordRow: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 14, top: 0, bottom: 0,
    justifyContent: "center",
  },
  eyeText: { fontSize: 18 },
  btnPrimary: {
    backgroundColor: AppColors.primary,
    borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", paddingVertical: 24,
  },
  footerText: { fontSize: 14, color: AppColors.textMuted },
  footerLink: { fontSize: 14, color: AppColors.primary, fontWeight: "700" },
});
