import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

describe('Toolchain & Test Runner Verification', () => {
  it('executes unit tests cleanly with jest-expo', () => {
    expect(1 + 1).toBe(2);
  });

  it('runs in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('verifies AsyncStorage mock is active', async () => {
    await AsyncStorage.setItem('test_key', 'test_val');
    const val = await AsyncStorage.getItem('test_key');
    expect(val).toBe('test_val');
  });

  it('verifies SecureStore mock is active', async () => {
    await SecureStore.setItemAsync('sec_key', 'sec_val');
    const val = await SecureStore.getItemAsync('sec_key');
    expect(val).toBe('sec_val');
  });
});
