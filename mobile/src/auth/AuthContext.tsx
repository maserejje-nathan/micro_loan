import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth';
import { ApiError } from '../api/client';
import { clearToken, getToken, setToken } from '../lib/storage';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  bootstrapping: boolean;
  signingIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          return;
        }

        const profile = await fetchMe(token);
        if (active) {
          setUser(profile.user);
        }
      } catch {
        await clearToken();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setBootstrapping(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setSigningIn(true);

    try {
      const response = await loginRequest(email.trim(), password);
      await setToken(response.token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        'Unable to reach the server. Check your API URL and that Laravel is running.',
        0,
      );
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local session even if the network request fails.
    } finally {
      await clearToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      signingIn,
      signIn,
      signOut,
    }),
    [user, bootstrapping, signingIn, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
