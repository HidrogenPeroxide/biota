/**
 * Lightweight i18n: a context provider + `t()` lookup with {placeholder}
 * interpolation, language persistence, and `<html lang>` syncing.
 *
 * No external library — the dictionary is just two objects (zh.ts / en.ts).
 * Latin scientific names are injected as values and stay Latin.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import zh from './zh'
import en from './en'
import { setApiLocale } from '@/api/inaturalist'

export type Lang = 'zh' | 'en'

const DICTS: Record<Lang, Record<string, string>> = {
  zh: zh as Record<string, string>,
  en: en as Record<string, string>,
}

const STORAGE_KEY = 'biota-lang'

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Translate a key, interpolating {placeholders}. */
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
  if (stored === 'zh' || stored === 'en') return stored
  const nav = navigator.language?.toLowerCase() ?? ''
  return nav.startsWith('zh') ? 'zh' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    // Keep API requests localized so species common names follow the UI.
    setApiLocale(lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(
    () => setLangState((l) => (l === 'zh' ? 'en' : 'zh')),
    [],
  )

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = DICTS[lang]
      let s = dict[key] ?? DICTS.zh[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return s
    },
    [lang],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Full i18n context (lang, setters, t). */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within a LangProvider')
  return ctx
}

/** Just the current language. */
export function useLang(): Lang {
  return useI18n().lang
}

/** Just the translator. */
export function useT(): I18nContextValue['t'] {
  return useI18n().t
}

/** Translate an iconic-taxon key (e.g. "Aves") to the localized label. */
export function useTaxonLabel() {
  const t = useT()
  return (iconic: string | null | undefined, fallback?: string) => {
    if (!iconic) return fallback ?? ''
    const key = `taxa.${iconic}`
    const localized = t(key)
    return localized === key ? fallback ?? localized : localized
  }
}
