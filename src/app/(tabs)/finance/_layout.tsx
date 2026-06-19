import { DarkTheme, DefaultTheme, Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function FinanceLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackTitle: "Kembali",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Menu Keuangan",
        }}
      />
      <Stack.Screen
        name="income/index"
        options={{
          title: "Daftar Pendapatan",
        }}
      />
      <Stack.Screen
        name="expense/index"
        options={{
          title: "Daftar Pengeluaran",
        }}
      />
    </Stack>
  );
}
