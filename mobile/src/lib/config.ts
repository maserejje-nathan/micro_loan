import { Platform } from 'react-native';

/**
 * iOS simulator: localhost works.
 * Android emulator: 10.0.2.2 maps to the host machine.
 * Physical device: set EXPO_PUBLIC_API_URL to your computer's LAN IP.
 */
const fallbackHost =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? fallbackHost
).replace(/\/$/, '');
