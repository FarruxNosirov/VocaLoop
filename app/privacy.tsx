import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";

const UPDATED = "2026-09-18";

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>‹ Orqaga</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Maxfiylik siyosati</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Oxirgi yangilanish: {UPDATED}</Text>

        <Text style={s.h2}>{"Ma'lumotlaringiz qayerda saqlanadi"}</Text>
        <Text style={s.p}>
          {"VocaLoop hech qanday shaxsiy ma'lumotni yig'maydi va serverga yubormaydi. " +
            "Ismingiz, tarjima qilgan so'zlaringiz va test natijalaringiz faqat shu telefonning " +
            "xotirasida saqlanadi. Biz ularni ko'ra olmaymiz."}
        </Text>

        <Text style={s.h2}>Hisob talab qilinmaydi</Text>
        <Text style={s.p}>
          {"Ilovadan foydalanish uchun ro'yxatdan o'tish shart emas. Telefon raqam, email yoki " +
            "parol so'ralmaydi."}
        </Text>

        <Text style={s.h2}>Internet nima uchun ishlatiladi</Text>
        <Text style={s.p}>
          {"Faqat ikki holatda: so'zni tarjima qilganingizda va talaffuzni eshitganingizda " +
            "kiritilgan matn Google xizmatlariga (Google Translate va Text-to-Speech) " +
            "yuboriladi. Bundan boshqa hech qanday ma'lumot uzatilmaydi."}
        </Text>

        <Text style={s.h2}>{"Ma'lumotlarni o'chirish"}</Text>
        <Text style={s.p}>
          {"Profil → Ma'lumotlarni tozalash tugmasi barcha so'zlar va natijalarni o'chiradi. " +
            "Ilovani telefondan o'chirsangiz ham hamma ma'lumot birga o'chadi."}
        </Text>

        <Text style={s.h2}>Reklama va kuzatuv</Text>
        <Text style={s.p}>
          {"Ilovada reklama yo'q, tahlil (analytics) va kuzatuv tizimlari ishlatilmaydi."}
        </Text>

        <Text style={s.h2}>Bolalar</Text>
        <Text style={s.p}>
          {"Ilova bolalardan shaxsiy ma'lumot yig'maydi, chunki umuman shaxsiy ma'lumot yig'ilmaydi."}
        </Text>

        <View style={s.divider} />

        <Text style={s.h2}>Privacy Policy (English)</Text>
        <Text style={s.p}>
          VocaLoop does not collect or transmit any personal data. Your name, the words you
          translate and your quiz results are stored only in this device&apos;s local storage and are
          never sent to us. No account is required.
        </Text>
        <Text style={s.p}>
          The app uses the internet only for two things: text you enter is sent to Google
          Translate for translation, and to Google Text-to-Speech to generate pronunciation.
          Nothing else leaves your device.
        </Text>
        <Text style={s.p}>
          You can erase everything at any time from Profile → Clear data, or by uninstalling the
          app. The app contains no ads, analytics or tracking.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 80 },
    backText: { fontSize: 16, color: colors.primary, fontWeight: "600" },
    headerTitle: {
      flex: 1, textAlign: "center",
      fontSize: 16, fontWeight: "800", color: colors.textPrimary,
    },
    body: { paddingHorizontal: 20, paddingTop: 16 },
    updated: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
    h2: {
      fontSize: 16, fontWeight: "800", color: colors.textPrimary,
      marginTop: 22, marginBottom: 6,
    },
    p: { fontSize: 15, lineHeight: 23, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border, marginTop: 28 },
  });
}
