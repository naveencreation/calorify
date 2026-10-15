import { Linking } from 'react-native';

export const LEGAL_URLS = {
  PRIVACY_POLICY: 'https://calorify.app/privacy',
  TERMS_OF_SERVICE: 'https://calorify.app/terms',
  GEMINI_API_KEYS: 'https://aistudio.google.com/apikey',
} as const;

export const openExternalLink = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
};
