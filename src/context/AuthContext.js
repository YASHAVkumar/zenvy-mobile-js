import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, restoreSession, signIn, signUp } from '../services/authService';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { let active = true; restoreSession().then((value) => { if (active) setSession(value); }).catch(() => {}).finally(() => { if (active) setReady(true); }); return () => { active = false; }; }, []);
  const login = useCallback(async (credentials) => { const next = await signIn(credentials); setSession(next); return next; }, []);
  const register = useCallback(async (details) => { const next = await signUp(details); setSession(next); return next; }, []);
  const logout = useCallback(async () => { await clearSession(); setSession(null); }, []);
  const value = useMemo(() => ({ session, user: session?.user || null, ready, mode: session?.mode || 'guest', login, register, logout }), [session, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
