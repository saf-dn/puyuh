import { F } from "@/constants/theme";
import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from "react-native";

interface ThemeTextProps extends RNTextProps {
  variant?: "body" | "heading";
}

export function ThemeText({ style, variant, ...props }: ThemeTextProps) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const fontSize = flatStyle.fontSize || 14;
  const fontWeight = flatStyle.fontWeight || "400";
  
  // Auto-detect heading if not explicitly provided
  const isHeading = variant === "heading" || fontSize >= 18 || fontWeight === "800" || fontWeight === "900" || fontWeight === "bold";

  let fontFamily: string = F.body;

  if (isHeading) {
    if (fontWeight === "400" || fontWeight === "normal") fontFamily = F.heading;
    else if (fontWeight === "500") fontFamily = F.headingSemi;
    else if (fontWeight === "600") fontFamily = F.headingSemi;
    else fontFamily = F.headingBold;
  } else {
    if (fontWeight === "400" || fontWeight === "normal") fontFamily = F.body;
    else if (fontWeight === "500") fontFamily = F.bodyMed;
    else if (fontWeight === "600") fontFamily = F.bodySemi;
    else fontFamily = F.bodyBold;
  }

  // Remove fontWeight to avoid system font overrides on some platforms,
  // since we are baking the weight into the font family.
  const { fontWeight: _fw, ...restStyle } = flatStyle;

  return <RNText style={[restStyle, { fontFamily }]} {...props} />;
}
