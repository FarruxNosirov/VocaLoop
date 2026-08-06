import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemeColors } from "@/constants/app-colors";
import { useTheme } from "@/context/theme-context";
import { getSuggestions } from "@/services/autocomplete";

interface Props {
  onTranslate: (inputText: string) => Promise<void>;
  translatedText: string;
  isLoading: boolean;
}

export function TranslateInput({ onTranslate, translatedText, isLoading }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!inputText.trim() || inputText.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      const results = await getSuggestions(inputText);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText]);

  async function handlePress() {
    if (!inputText.trim()) return;
    setShowSuggestions(false);
    setSuggestions([]);
    await onTranslate(inputText.trim());
    setInputText("");
  }

  async function handleSuggestionPress(word: string) {
    setInputText(word);
    setShowSuggestions(false);
    setSuggestions([]);
    await onTranslate(word);
    setInputText("");
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="So'z yoki ibora kiriting..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handlePress}
            returnKeyType="go"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handlePress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>→</Text>
            )}
          </TouchableOpacity>
        </View>

        {showSuggestions && !isLoading && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((word) => (
              <TouchableOpacity
                key={word}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(word)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionIcon}>🔤</Text>
                <Text style={styles.suggestionText}>{word}</Text>
                <Text style={styles.suggestionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {translatedText && !showSuggestions ? (
          <View style={styles.resultCard}>
            <View style={styles.resultDot} />
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { paddingHorizontal: 16, marginBottom: 4 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18, padding: 14, gap: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
    input: {
      flex: 1, backgroundColor: colors.background,
      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, color: colors.textPrimary,
    },
    button: {
      backgroundColor: colors.primary,
      width: 48, height: 48, borderRadius: 14,
      alignItems: "center", justifyContent: "center",
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: 22, fontWeight: "600" },
    suggestionsBox: { backgroundColor: colors.background, borderRadius: 14, overflow: "hidden" },
    suggestionItem: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 12, gap: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    suggestionIcon: { fontSize: 14 },
    suggestionText: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    suggestionArrow: { fontSize: 14, color: colors.primary, fontWeight: "700" },
    resultCard: {
      backgroundColor: colors.primaryLight, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      flexDirection: "row", alignItems: "center", gap: 10,
    },
    resultDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    },
    resultText: { fontSize: 18, fontWeight: "700", color: colors.primary, flex: 1 },
  });
}
