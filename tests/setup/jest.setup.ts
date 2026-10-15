// Global test setup for Calorify v2

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    ALWAYS: 'ALWAYS',
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY',
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {
    initializeApp: jest.fn(),
    app: jest.fn(),
    apps: [],
  },
}));

// Mock @react-native-firebase/crashlytics
jest.mock('@react-native-firebase/crashlytics', () => {
  const instance = {
    recordError: jest.fn(),
    setUserId: jest.fn(),
    log: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn(() => instance),
    getCrashlytics: jest.fn(() => instance),
  };
});

// Mock @react-native-firebase/analytics
jest.mock('@react-native-firebase/analytics', () => {
  const instance = {
    logEvent: jest.fn(),
    setUserId: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn(() => instance),
    getAnalytics: jest.fn(() => instance),
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
      Text: ReactNative.Text,
      ScrollView: ReactNative.ScrollView,
    },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (factory: () => unknown) => (typeof factory === 'function' ? factory() : {}),
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
    withDelay: (_delay: unknown, value: unknown) => value,
    cancelAnimation: () => {},
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    interpolate: (_value: unknown, _input: unknown, output: unknown[]) => output?.[0] ?? 0,
    Extrapolate: { CLAMP: 'clamp' },
    FadeIn: { duration: () => ({ delay: () => ({}) }) },
    FadeOut: { duration: () => ({ delay: () => ({}) }) },
    FadeInDown: { duration: () => ({ delay: () => ({ springify: () => ({}) }) }) },
    FadeOutDown: { duration: () => ({ delay: () => ({}) }) },
    SlideInRight: { duration: () => ({}) },
    SlideOutRight: { duration: () => ({}) },
    Easing: {
      out: (fn: (t: number) => number) => (t: number) => (typeof fn === 'function' ? 1 - fn(1 - t) : t),
      inOut: (fn: (t: number) => number) => (t: number) =>
        typeof fn === 'function' ? (t < 0.5 ? fn(t * 2) / 2 : 1 - fn((1 - t) * 2) / 2) : t,
      in: (fn: (t: number) => number) => (t: number) => (typeof fn === 'function' ? fn(t) : t),
      cubic: (t: number) => t * t * t,
      quad: (t: number) => t * t,
      linear: (t: number) => t,
      bezier: () => ({ factory: () => (t: number) => t }),
    },
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = (props: any) => React.createElement(Text, props, props.name || 'icon');
  return {
    Feather: MockIcon,
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    FontAwesome: MockIcon,
    AntDesign: MockIcon,
  };
});
