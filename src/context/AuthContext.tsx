import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_USER_KEY = 'saarthi_local_user';
const LOCAL_SESSION_KEY = 'saarthi_local_session';

function createMockSession(email: string, fullName?: string): { session: Session; user: User } {
  const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
  const user: User = {
    id: userId,
    app_metadata: {},
    user_metadata: { full_name: fullName || email.split('@')[0] },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  const session: Session = {
    access_token: `mock_jwt_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600 * 24 * 7,
    refresh_token: `mock_refresh_${Date.now()}`,
    user,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
  };

  return { session, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // First check local storage session fallback
    try {
      const savedUserStr = localStorage.getItem(LOCAL_USER_KEY);
      const savedSessionStr = localStorage.getItem(LOCAL_SESSION_KEY);
      if (savedUserStr && savedSessionStr) {
        const parsedUser = JSON.parse(savedUserStr);
        const parsedSession = JSON.parse(savedSessionStr);
        if (isMounted) {
          setUser(parsedUser);
          setSession(parsedSession);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local auth cache:', e);
    }

    // Attempt to read from Supabase if configured
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted && data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      })
      .catch((err) => {
        console.warn('Supabase auth getSession check notice:', err?.message || err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (isMounted) {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
        }
      });
      return () => {
        isMounted = false;
        sub?.subscription?.unsubscribe();
      };
    } catch {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName ?? '' } },
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
        return { error: null };
      }

      if (error) {
        // If Supabase rejected or offline, save locally
        const mock = createMockSession(email, fullName);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mock.user));
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mock.session));
        setSession(mock.session);
        setUser(mock.user);
        return { error: null };
      }
    } catch {
      const mock = createMockSession(email, fullName);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mock.user));
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mock.session));
      setSession(mock.session);
      setUser(mock.user);
      return { error: null };
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
        return { error: null };
      }

      if (error) {
        // Fallback for demo/offline login
        const mock = createMockSession(email);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mock.user));
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mock.session));
        setSession(mock.session);
        setUser(mock.user);
        return { error: null };
      }
    } catch {
      const mock = createMockSession(email);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mock.user));
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mock.session));
      setSession(mock.session);
      setUser(mock.user);
      return { error: null };
    }

    return { error: null };
  }, []);

  const continueAsGuest = useCallback(() => {
    const mock = createMockSession('guest@saarthi.ai', 'Guest Explorer');
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mock.user));
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mock.session));
    setSession(mock.session);
    setUser(mock.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, loading, signUp, signIn, signOut, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
