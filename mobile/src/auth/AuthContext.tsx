import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchMe,
  fetchPortalMe,
  login as loginRequest,
  logout as logoutRequest,
  portalLogin,
  portalLogout,
} from '../api/auth';
import { ApiError } from '../api/client';
import {
  clearSession,
  getAuthMode,
  getToken,
  setAuthMode,
  setToken,
} from '../lib/storage';
import type { AuthMode, PortalCustomer, User } from '../types';

type AuthContextValue = {
  mode: AuthMode | null;
  user: User | null;
  portalCustomer: PortalCustomer | null;
  permissions: string[];
  bootstrapping: boolean;
  signingIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInPortal: (
    phone: string,
    password: string,
    organizationSlug: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portalCustomer, setPortalCustomer] = useState<PortalCustomer | null>(
    null,
  );
  const [permissions, setPermissions] = useState<string[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [token, storedMode] = await Promise.all([
          getToken(),
          getAuthMode(),
        ]);

        if (!token || !storedMode) {
          return;
        }

        if (storedMode === 'portal') {
          const profile = await fetchPortalMe(token);
          if (active) {
            setMode('portal');
            setPortalCustomer(profile.customer);
            setUser(null);
            setPermissions([]);
          }
          return;
        }

        const profile = await fetchMe(token);
        if (active) {
          setMode('staff');
          setUser({
            ...profile.user,
            is_super_admin: Boolean(profile.user.is_super_admin),
          });
          setPermissions(profile.permissions ?? []);
          setPortalCustomer(null);
        }
      } catch {
        await clearSession();
        if (active) {
          setMode(null);
          setUser(null);
          setPortalCustomer(null);
          setPermissions([]);
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
      await setAuthMode('staff');

      const profile = await fetchMe(response.token);
      setMode('staff');
      setUser({
        ...profile.user,
        is_super_admin: Boolean(profile.user.is_super_admin),
      });
      setPermissions(profile.permissions ?? []);
      setPortalCustomer(null);
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

  const signInPortal = useCallback(
    async (phone: string, password: string, organizationSlug: string) => {
      setSigningIn(true);

      try {
        const response = await portalLogin(
          phone.trim(),
          password,
          organizationSlug.trim(),
        );
        await setToken(response.token);
        await setAuthMode('portal');
        setMode('portal');
        setPortalCustomer(response.customer);
        setUser(null);
        setPermissions([]);
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
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      if (mode === 'portal') {
        await portalLogout();
      } else {
        await logoutRequest();
      }
    } catch {
      // Clear local session even if the network request fails.
    } finally {
      await clearSession();
      setMode(null);
      setUser(null);
      setPortalCustomer(null);
      setPermissions([]);
    }
  }, [mode]);

  const can = useCallback(
    (permission: string) => {
      if (user?.is_super_admin) {
        return true;
      }
      if (permissions.includes('*')) {
        return true;
      }
      return permissions.includes(permission);
    },
    [permissions, user?.is_super_admin],
  );

  const value = useMemo(
    () => ({
      mode,
      user,
      portalCustomer,
      permissions,
      bootstrapping,
      signingIn,
      signIn,
      signInPortal,
      signOut,
      can,
    }),
    [
      mode,
      user,
      portalCustomer,
      permissions,
      bootstrapping,
      signingIn,
      signIn,
      signInPortal,
      signOut,
      can,
    ],
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
