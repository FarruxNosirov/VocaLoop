import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import { SERVER_ENABLED } from "@/services/config";

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Serversiz rejimda login talab qilinmaydi — ilova to'g'ridan ochiladi
    if (!SERVER_ENABLED || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="kitob/units" options={{ headerShown: false }} />
        <Stack.Screen name="kitob/unit" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/index" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/result" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/irregular" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
