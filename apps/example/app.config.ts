import type {ExpoConfig} from 'expo/config'

// Not "Expo Native Icons": the generated Xcode target would be `ExpoNativeIcons`, the Swift module of the package.
const NAME = 'Icons Example'
const BUNDLE_ID = 'com.hzblj.exponativeicons.example'

export default {
  android: {
    package: BUNDLE_ID,
  },
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
  },
  name: NAME,
  orientation: 'portrait',
  plugins: [
    'expo-router',
    // The package's own plugin, configured the way an app without kara does it. kara's `icons` option would hand these
    // same options to it, but this example shows the package, not kara. kara's tab bar and atoms then draw the same
    // generated assets by name: every SVG in assets/icons becomes an image set and a vector drawable at prebuild, and
    // its name a type in native-icons.d.ts. Loaded from plugin/build, which is why `yarn prebuild` builds it first.
    ['@hzblj/expo-native-icons', {source: './assets/icons'}],
    // The scene life cycle, which apps built with the iOS 27 SDK need or they stop at launch: Expo 57's template has
    // none, so React Native starts from Expo's scene delegate instead. Remove it with the move to Expo 58.
    ['expo-build-properties', {ios: {enableSceneSupport: true}}],
  ],
  scheme: 'native-icons-example',
  slug: 'expo-native-icons-example',
  userInterfaceStyle: 'automatic',
  version: '1.0.0',
} satisfies ExpoConfig
