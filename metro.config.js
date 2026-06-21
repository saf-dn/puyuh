// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for expo-sqlite on web (wa-sqlite.wasm)
config.resolver.assetExts.push('wasm');

// Required for @supabase/supabase-js (.mjs / .cjs modules)
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
