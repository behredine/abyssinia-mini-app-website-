import type React from "react";
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getStoredToken, onUnauthorized, setStoredToken, type User } from "../lib/api";
import { telegram } from "../lib/telegram";

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      telegram.boot();
      const initData = await telegram.waitForInitData();

      if (!initData) {
        throw new Error("Telegram did not provide sign-in data. Close and reopen the mini app from the bot.");
      }

      const auth = await api.authTelegram(initData);
      setStoredToken(auth.token);
      setToken(auth.token);

      if (auth.user) {
        setUser(auth.user);
      } else {
        setUser(await api.me());
      }
    } catch (caught) {
      logout();
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    telegram.boot();
    onUnauthorized(refreshAuth);

    if (getStoredToken()) {
      api.me()
        .then(setUser)
        .catch(refreshAuth)
        .finally(() => setIsLoading(false));
    } else {
      refreshAuth();
    }
  }, [refreshAuth]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoading,
      error,
      isAuthenticated: Boolean(token),
      refreshAuth,
      logout,
    }),
    [error, isLoading, logout, refreshAuth, token, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
