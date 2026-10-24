---
"@hzblj/expo-native-icons": patch
---

Android: an icon without a `color` is now drawn in the theme's primary text colour. The drawable never received the view's state, so the theme's colour selector picked its disabled entry, a faded grey.
