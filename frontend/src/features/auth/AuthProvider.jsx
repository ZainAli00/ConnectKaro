import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../../services/authService';
import { setAccessToken } from '../../services/apiClient';

/**
 * Holds the current admin session. Context value shape:
 *   { admin, isAuthenticated, isLoading, login(email, password), logout() }
 *
 * On mount, silently attempts authService.refresh() to re-establish a
 * session from the httpOnly refresh cookie (normal on every hard page
 * load, since the access token only ever lives in memory). Failure here is
 * the expected "not logged in" state — it is not surfaced as an error.
 */
export const AuthContext = createContext({
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshData = await authService.refresh();
        setAccessToken(refreshData.accessToken);
        const meData = await authService.me();
        if (!cancelled) setAdmin(meData.admin);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setAdmin(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setAccessToken(data.accessToken);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
    }),
    [admin, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
