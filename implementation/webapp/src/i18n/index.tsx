import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import ptBR from './locales/pt-BR.json';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocaleMessages = Record<string, unknown>;
type Params = Record<string, string | number>;

interface I18nContextValue {
  locale: string;
  t: (key: string, params?: Params) => string;
  tRaw: (key: string) => unknown;
  setLocale: (locale: string) => void;
}

// ─── Available locales ────────────────────────────────────────────────────────

const LOCALES: Record<string, LocaleMessages> = {
  'pt-BR': ptBR as LocaleMessages,
};

export const DEFAULT_LOCALE = 'pt-BR';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveKey(messages: LocaleMessages, key: string): string {
  const parts = key.split('.');
  let current: unknown = messages;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : key;
}

function resolveKeyRaw(messages: LocaleMessages, key: string): unknown {
  const parts = key.split('.');
  let current: unknown = messages;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function interpolate(template: string, params: Params): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) => {
    const value = params[paramKey];
    return value !== undefined ? String(value) : `{{${paramKey}}}`;
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: string;
}

export function I18nProvider({ children, defaultLocale = DEFAULT_LOCALE }: I18nProviderProps) {
  const [locale, setLocale] = useState<string>(defaultLocale);

  const t = useCallback(
    (key: string, params?: Params): string => {
      const messages = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
      const resolved = resolveKey(messages, key);
      return params ? interpolate(resolved, params) : resolved;
    },
    [locale],
  );

  const tRaw = useCallback(
    (key: string): unknown => {
      const messages = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
      return resolveKeyRaw(messages, key);
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, t, tRaw, setLocale }}>{children}</I18nContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
