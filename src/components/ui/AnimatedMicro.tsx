import { C, F } from "@/constants/theme";
import React, { useState } from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ThemeText as Text } from "@/components/ui/ThemeText";

// ============================================================================
// 1. AnimatedButton (Press Scaling Micro-interaction)
// Trigger: Press (Touch Down)
// Purpose: Delight & Feedback (shows it's clickable and registers touch)
// ============================================================================

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleDownTo?: number;
}

export function AnimatedButton({
  children,
  style,
  scaleDownTo = 0.95,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(scaleDownTo, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressableComponent
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressableComponent>
  );
}

// ============================================================================
// 2. AnimatedInput (Focus & Border Glow Micro-interaction)
// Trigger: Focus / Blur
// Purpose: Guidance (tells user exactly which field is active)
// ============================================================================

interface AnimatedInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
}

export function AnimatedInput({
  containerStyle,
  error,
  onFocus,
  onBlur,
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Animate border width and color intensity
  const borderWidth = useSharedValue(1);
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, { duration: 150 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 200 });
    if (onBlur) onBlur(e);
  };

  const borderColor = error
    ? C.expense
    : isFocused
    ? C.white // Focus glow color
    : "transparent"; // Unfocused color

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: withTiming(borderColor, { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.inputContainer, containerStyle, animatedStyle]}>
      <TextInput
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, props.style]}
        placeholderTextColor={C.textMuted}
      />
    </Animated.View>
  );
}

// ============================================================================
// 3. StatusBadge (Smooth appearing status indicator)
// Trigger: Mount / State Change
// Purpose: Status indication
// ============================================================================

export function StatusBadge({ status, color }: { status: string; color: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    backgroundColor: `${color}25`, // 25% opacity background
  }));

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: C.card2,
    borderRadius: 16,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: C.textPrimary,
    minHeight: 56,
    fontFamily: F.body,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
