import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";
import { Language, LANGUAGES } from "@/constants/languages";

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
  label: string;
}

export function LanguagePicker({ selected, onSelect, label }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? LANGUAGES.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.code.includes(search.toLowerCase()),
      )
    : LANGUAGES;

  function handleSelect(lang: Language) {
    onSelect(lang);
    setVisible(false);
    setSearch("");
  }

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectorFlag}>{selected.flag}</Text>
        <View style={styles.selectorInfo}>
          <Text style={styles.selectorLabel}>{label}</Text>
          <Text style={styles.selectorName}>{selected.name}</Text>
        </View>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label} tilini tanlang</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setSearch(""); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Til qidiring..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    item.code === selected.code && styles.langItemActive,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <Text style={styles.langName}>{item.name}</Text>
                  <Text style={styles.langCode}>{item.code}</Text>
                  {item.code === selected.code && (
                    <Text style={styles.langCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    selector: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.surface, borderRadius: 14,
      paddingHorizontal: 12, paddingVertical: 10, gap: 8, flex: 1,
    },
    selectorFlag: { fontSize: 22 },
    selectorInfo: { flex: 1 },
    selectorLabel: { fontSize: 10, color: colors.textMuted, fontWeight: "600" },
    selectorName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
    selectorArrow: { fontSize: 10, color: colors.textMuted },
    modalOverlay: {
      flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: "80%", paddingBottom: 34,
    },
    modalHeader: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    modalClose: { fontSize: 18, color: colors.textMuted, padding: 4 },
    searchBox: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: 16, marginBottom: 8,
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    },
    searchIcon: { fontSize: 14 },
    searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
    langItem: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingVertical: 14, gap: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    langItemActive: { backgroundColor: colors.primaryLight },
    langFlag: { fontSize: 24 },
    langName: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    langCode: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
    langCheck: { fontSize: 16, color: colors.primary, fontWeight: "800" },
  });
}
