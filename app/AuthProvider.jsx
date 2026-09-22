'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api';
import { assertCurrentUser, unwrapData } from '../lib/contracts';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await authApi.me();
      const currentUser = assertCurrentUser(unwrapData(response));
      setUser(currentUser);
      setStatus('authenticated');
      return currentUser;
    } catch (requestError) {
      setUser(null);
      if (requestError.status === 401) {
        setStatus('unauthenticated');
        return null;
      }
      setError(requestError);
      setStatus('error');
      return null;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const currentUser = assertCurrentUser(unwrapData(response));
    setUser(currentUser);
    setError(null);
    setStatus('authenticated');
    return currentUser;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setError(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    error,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    refresh,
    signIn,
    signOut,
  }), [user, status, error, refresh, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
