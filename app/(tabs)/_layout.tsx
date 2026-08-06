import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/context/theme-context";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tarjimon",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="kitoblar"
        options={{
          title: "Kitoblar",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="oyinlar"
        options={{
          title: "O'yinlar",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎮" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen name="tarix" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({
  emoji,
  focused,
  colors,
}: {
  emoji: string;
  focused: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[
        styles.iconBox,
        focused && { backgroundColor: colors.primaryLight },
      ]}
    >
      <Text style={styles.iconEmoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 40,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 20 },
});
