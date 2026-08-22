import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'kn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'bn'
  | 'ml';

export const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export interface A11ySettings {
  fontScale: number;
  highContrast: boolean;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  simpleLanguage: boolean;
  largeControls: boolean;
  reduceMotion: boolean;
  language: LanguageCode;
}

const DEFAULT_SETTINGS: A11ySettings = {
  fontScale: 1,
  highContrast: false,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 1.5,
  simpleLanguage: false,
  largeControls: false,
  reduceMotion: false,
  language: 'en',
};

interface A11yContextValue {
  settings: A11ySettings;
  update: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  reset: () => void;
  syncing: boolean;
}

const A11yContext = createContext<A11yContextValue | null>(null);

const STORAGE_KEY = 'saarthi-a11y';

function loadSettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function settingsToDb(s: A11ySettings) {
  return {
    font_scale: s.fontScale,
    high_contrast: s.highContrast,
    letter_spacing: s.letterSpacing,
    word_spacing: s.wordSpacing,
    line_height: s.lineHeight,
    simple_language: s.simpleLanguage,
    large_controls: s.largeControls,
    reduce_motion: s.reduceMotion,
    language: s.language,
  };
}

function dbToSettings(row: Record<string, unknown>): A11ySettings {
  return {
    fontScale: Number(row.font_scale ?? 1),
    highContrast: Boolean(row.high_contrast ?? false),
    letterSpacing: Number(row.letter_spacing ?? 0),
    wordSpacing: Number(row.word_spacing ?? 0),
    lineHeight: Number(row.line_height ?? 1.5),
    simpleLanguage: Boolean(row.simple_language ?? false),
    largeControls: Boolean(row.large_controls ?? false),
    reduceMotion: Boolean(row.reduce_motion ?? false),
    language: (row.language as LanguageCode) ?? 'en',
  };
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(loadSettings);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadedFromDb, setLoadedFromDb] = useState(false);

  // Track auth state and load from DB
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          const { data } = await supabase
            .from('accessibility_preferences')
            .select('*')
            .eq('user_id', uid)
            .maybeSingle();
          if (data) {
            const dbSettings = dbToSettings(data);
            setSettings(dbSettings);
          }
          setLoadedFromDb(true);
        } else {
          setLoadedFromDb(true);
        }
      })();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Apply settings to DOM + localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-font-scale', String(settings.fontScale));
    root.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}em`);
    root.style.setProperty('--a11y-word-spacing', `${settings.wordSpacing}em`);
    root.style.setProperty('--a11y-line-height', String(settings.lineHeight));
    root.dataset.contrast = settings.highContrast ? '1' : '0';
    root.dataset.largeControls = settings.largeControls ? '1' : '0';
    root.dataset.reduceMotion = settings.reduceMotion ? '1' : '0';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  // Debounced sync to DB
  useEffect(() => {
    if (!userId || !loadedFromDb) return;
    setSyncing(true);
    const id = setTimeout(async () => {
      const payload = settingsToDb(settings);
      const { data: existing } = await supabase
        .from('accessibility_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase.from('accessibility_preferences').update(payload).eq('user_id', userId);
      } else {
        await supabase.from('accessibility_preferences').insert({ user_id: userId, ...payload });
      }
      setSyncing(false);
    }, 800);
    return () => clearTimeout(id);
  }, [settings, userId, loadedFromDb]);

  const update = useCallback<A11yContextValue['update']>((key, val) => {
    setSettings((s) => ({ ...s, [key]: val }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<A11yContextValue>(
    () => ({ settings, update, reset, syncing }),
    [settings, update, reset, syncing],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within A11yProvider');
  return ctx;
}
