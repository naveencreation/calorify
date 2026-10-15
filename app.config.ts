import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Calorify',
  slug: 'calori',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/logo.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#FAF9F6',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.calorify.app',
    backgroundColor: '#FAF9F6',
  },
  android: {
    package: 'com.calorify.app',
    backgroundColor: '#FAF9F6',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FAF9F6',
    },
    permissions: ['android.permission.health.READ_STEPS'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Kurale_400Regular.ttf',
          './assets/fonts/Poppins_400Regular.ttf',
          './assets/fonts/Poppins_500Medium.ttf',
          './assets/fonts/Poppins_600SemiBold.ttf',
          './assets/fonts/Poppins_700Bold.ttf',
          './assets/fonts/Urbanist_400Regular.ttf',
          './assets/fonts/Urbanist_500Medium.ttf',
          './assets/fonts/Urbanist_600SemiBold.ttf',
          './assets/fonts/Urbanist_700Bold.ttf',
          './assets/fonts/Urbanist_800ExtraBold.ttf',
        ],
      },
    ],
    'expo-image',
    'expo-image-picker',
    [
      'expo-camera',
      {
        barcodeScannerEnabled: true,
        recordAudioAndroid: false,
      },
    ],
    'expo-secure-store',
    'expo-splash-screen',
    'react-native-health-connect',
    './plugins/withHealthConnectRationale.js',
    'expo-notifications',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 26,
        },
        ios: {
          deploymentTarget: '16.4',
        },
      },
    ],
  ],
});
