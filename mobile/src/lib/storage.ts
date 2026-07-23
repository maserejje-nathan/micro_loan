import * as SecureStore from 'expo-secure-store';
import type { AuthMode } from '../types';

const TOKEN_KEY = 'avango_lender_token';
const MODE_KEY = 'avango_auth_mode';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getAuthMode(): Promise<AuthMode | null> {
  const mode = await SecureStore.getItemAsync(MODE_KEY);
  if (mode === 'staff' || mode === 'portal') {
    return mode;
  }
  return null;
}

export async function setAuthMode(mode: AuthMode): Promise<void> {
  await SecureStore.setItemAsync(MODE_KEY, mode);
}

export async function clearAuthMode(): Promise<void> {
  await SecureStore.deleteItemAsync(MODE_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([clearToken(), clearAuthMode()]);
}
