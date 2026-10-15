import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, Auth } from 'firebase/auth';
// @ts-expect-error react-native persistence from @firebase/auth lacks direct TypeScript export in root package
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getFirebaseEnvConfig } from '../config/env';

const firebaseConfig = getFirebaseEnvConfig();

// Initialize or reuse Firebase App
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth persistence keys contain colons and brackets rejected by SecureStore.
// We hex-encode the key so it adheres to Android Keystore / iOS Keychain constraints.
export const encodeSecureKey = (key: string): string => {
  let encoded = '';
  for (let i = 0; i < key.length; i++) {
    encoded += key.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return 'fb_auth_' + encoded;
};

const secureStorePersistence = {
  getItem: (key: string) => SecureStore.getItemAsync(encodeSecureKey(key)),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(encodeSecureKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(encodeSecureKey(key)),
};

let authInstance: Auth;
try {
  if (Platform.OS === 'web') {
    authInstance = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(secureStorePersistence),
    });
  }
} catch {
  // If already initialized (e.g. during Jest test runs or Fast Refresh)
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
