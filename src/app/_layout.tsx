import { initDatabase, isDbReady } from "@/database/db";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(isDbReady());
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (dbReady) {
      return;
    }

    initDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
        setDbError(
          error instanceof Error ? error.message : "Gagal memuat database",
        );
      });
  }, [dbReady]);

  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: "#C62828", textAlign: "center", fontSize: 14 }}>
          Database error: {dbError}
        </Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
