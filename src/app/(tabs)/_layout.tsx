import { DarkTheme, DefaultTheme, Tabs } from "expo-router";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? DarkTheme.colors : DefaultTheme.colors;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="finance"
        options={{
          title: "💰 Keuangan",
          headerTitle: "Menu Keuangan",
          tabBarLabel: "Keuangan",
        }}
      />

      <Tabs.Screen
        name="puyuh"
        options={{
          title: "🐔 Puyuh",
          headerTitle: "Detail Puyuh",
          tabBarLabel: "Puyuh",
        }}
      />

      <Tabs.Screen
        name="summary"
        options={{
          title: "📊 Ringkasan",
          headerTitle: "Dashboard Summary",
          tabBarLabel: "Ringkasan",
        }}
      />
    </Tabs>
  );
}
