import { C } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

function TabIcon({
  label,
  emoji,
  focused,
}: {
  label: string;
  emoji: string;
  focused: boolean;
}) {
  const scale = useSharedValue(focused ? 1 : 0);
  const width = useSharedValue(focused ? 100 : 40);

  useEffect(() => {
    scale.value = withTiming(focused ? 1 : 0, { duration: 300 });
    width.value = withSpring(focused ? 110 : 40, { damping: 14, stiffness: 120 });
  }, [focused, scale, width]);

  const rStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      backgroundColor: focused ? C.red : "transparent",
    };
  });

  const rTextStyle = useAnimatedStyle(() => {
    return {
      opacity: scale.value,
      transform: [{ scale: scale.value }],
      width: focused ? "auto" : 0,
      marginLeft: focused ? 6 : 0,
    };
  });

  return (
    <Animated.View style={[styles.tabItem, rStyle]}>
      <Animated.Text style={styles.tabEmoji}>{emoji}</Animated.Text>
      <Animated.Text numberOfLines={1} style={[styles.tabLabel, rTextStyle]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          // Add smooth shift animation built-in expo router v3+
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="finance"
          options={{
            title: "Keuangan",
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Keuangan" emoji="💰" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="puyuh"
          options={{
            title: "Puyuh",
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Puyuh" emoji="🐦" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="summary"
          options={{
            title: "Ringkasan",
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Ringkasan" emoji="📊" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg, // ensures behind-tab is black
  },
  tabBar: {
    position: "absolute",
    bottom: 24,
    left: "15%",
    right: "15%",
    elevation: 0,
    backgroundColor: "rgba(30, 30, 30, 0.8)", // glass effect
    borderRadius: 999,
    height: 64,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
