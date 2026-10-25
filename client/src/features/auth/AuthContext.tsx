import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refreshSession, setAuthFailureHandler } from '../../lib/http';
import { setAccessToken } from '../../lib/tokenStore';
import type { AuthPayload, User } from '../../lib/types';
import { authApi } from './api';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthValue {
  user: User | null;
  status: Status;
  login: (b: { email: string; password: string }) => Promise<void>;
  register: (b: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<boolean>; // used by the social-login callback page
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const queryClient = useQueryClient();

  const apply = useCallback((p: AuthPayload) => {
    setAccessToken(p.accessToken);
    setUser(p.user);
    setStatus('authenticated');
  }, []);

  const clear = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  // Uses the httpOnly cookie to get a fresh access token and the user.
  const restore = useCallback(async () => {
    try {
      apply(await refreshSession());
      return true;
    } catch {
      clear();
      return false;
    }
  }, [apply, clear]);

  useEffect(() => {
    setAuthFailureHandler(clear);
    void restore(); // on every page load
  }, [restore, clear]);

  const login: AuthValue['login'] = async (body) => apply(await authApi.login(body));
  const register: AuthValue['register'] = async (body) => apply(await authApi.register(body));

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      queryClient.clear(); // never keep one user's cached data for the next
    }
  };

  const value = useMemo(() => ({ user, status, login, register, logout, restore }), [user, status]); // eslint-disable-line react-hooks/exhaustive-deps
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}