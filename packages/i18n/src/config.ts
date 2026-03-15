export const locales = [
  'en', 'he', 'ru', 'ar', 'es', 'pt', 'it', 'de', 'ja', 'ko', 'zh', 'fr',
] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const rtlLocales: Locale[] = ['he', 'ar']

/** Check if a locale is RTL */
export const isRTL = (locale: Locale): boolean => {
  return rtlLocales.includes(locale)
}

/** Get text direction for a locale */
export const getDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

/** Locale display names */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  ru: 'Русский',
  ar: 'العربية',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  fr: 'Français',
}

/** Font stacks per locale */
export const localeFonts: Record<Locale, string> = {
  en: "'Inter', system-ui, sans-serif",
  he: "'Heebo', 'Assistant', system-ui, sans-serif",
  ru: "'Inter', system-ui, sans-serif",
  ar: "'IBM Plex Arabic', 'Noto Sans Arabic', sans-serif",
  es: "'Inter', system-ui, sans-serif",
  pt: "'Inter', system-ui, sans-serif",
  it: "'Inter', system-ui, sans-serif",
  de: "'Inter', system-ui, sans-serif",
  ja: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
  ko: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
  zh: "'Noto Sans SC', 'PingFang SC', sans-serif",
  fr: "'Inter', system-ui, sans-serif",
}
