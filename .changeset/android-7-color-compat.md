---
"@hzblj/expo-native-icons": patch
---

Android 7 (API 24/25) no longer crashes when an icon has `iconColor`, `secondaryColor` or `tertiaryColor`: the colours are read through Expo's `ColorCompat` instead of `Color.toArgb()`, which exists only from Android 8. Needs `expo-modules-core` 57.0.4 or newer.
