'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Locale = 'en' | 'he'

type LocaleContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  isRTL: boolean
  dir: 'ltr' | 'rtl'
  t: (key: string) => string
}

/** Simple Hebrew translation map — sourced from packages/i18n/messages/he.json */
const heTranslations: Record<string, string> = {
  // common
  'common.loading': 'טוען...',
  'common.save': 'שמור',
  'common.cancel': 'ביטול',
  'common.delete': 'מחק',
  'common.edit': 'ערוך',
  'common.create': 'צור',
  'common.publish': 'פרסם',
  'common.settings': 'הגדרות',
  // auth
  'auth.signIn': 'התחברות',
  'auth.signUp': 'הרשמה',
  'auth.signOut': 'התנתקות',
  'auth.email': 'אימייל',
  'auth.password': 'סיסמה',
  'auth.forgotPassword': 'שכחת סיסמה?',
  'auth.continueWithGoogle': 'המשך עם Google',
  'auth.sendMagicLink': 'שלח קישור קסם',
  'auth.welcomeBack': 'ברוכים הבאים ל-UBuilder',
  'auth.signInDescription': 'התחבר לחשבון שלך',
  // dashboard
  'dashboard.title': 'האתרים שלי',
  'dashboard.description': 'צור ונהל את האתרים שלך',
  'dashboard.newSite': '+ אתר חדש',
  'dashboard.createFirst': 'צור את האתר הראשון שלך',
  'dashboard.draft': 'טיוטה',
  'dashboard.published': 'מפורסם',
  'dashboard.archived': 'בארכיון',
  // editor
  'editor.publish': 'פרסם',
  'editor.preview': 'תצוגה מקדימה',
  'editor.desktop': 'מחשב',
  'editor.mobile': 'נייד',
  'editor.undo': 'בטל',
  'editor.redo': 'חזור',
  'editor.chat': 'צ׳אט',
  'editor.code': 'קוד',
  'editor.selectToEdit': 'בחר לעריכה',
  'editor.chatPlaceholder': 'ספר לי מה לשנות...',
  'editor.regenerate': 'צור מחדש',
  'editor.editPrompt': 'ערוך הנחיה',
  'editor.upload': 'העלה',
  'editor.rewrite': 'כתוב מחדש',
  'editor.redesign': 'עצב מחדש',
  // newSite
  'newSite.title': 'צור אתר חדש',
  'newSite.description': 'תאר את החזון שלך ותן ל-AI לבנות עבורך',
  'newSite.fromScratch': 'מאפס',
  'newSite.fromUrl': 'מקישור',
  'newSite.fromImage': 'מתמונה',
  'newSite.promptPlaceholder': 'אני רוצה ליצור אתר עבור...',
  'newSite.generateSite': 'צור אתר',
  'newSite.orStartFromTemplate': 'או התחל מתבנית',
  'newSite.selectIndustry': 'בחר את התחום שלך',
  // locale
  'locale.english': 'English',
  'locale.hebrew': 'עברית',
  'locale.selectLanguage': 'בחר שפה',
}

const STORAGE_KEY = 'ubuilder_locale'

/** Detect browser language — returns 'he' if Hebrew, 'en' otherwise */
const detectBrowserLocale = (): Locale => {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language || ''
  return lang.startsWith('he') ? 'he' : 'en'
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  isRTL: false,
  dir: 'ltr',
  t: (key: string) => key,
})

/** Hook to access locale context */
export const useLocale = () => useContext(LocaleContext)

/** Provider component — wraps app to provide locale state */
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Initialize locale from localStorage or browser detection
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'he' || stored === 'en') {
      setLocaleState(stored)
    } else {
      setLocaleState(detectBrowserLocale())
    }
  }, [])

  // Update document attributes when locale changes
  useEffect(() => {
    const dir = locale === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const isRTL = locale === 'he'
  const dir = isRTL ? 'rtl' as const : 'ltr' as const

  /** Translate a key — returns Hebrew translation if locale is 'he', otherwise returns the key's last segment */
  const t = useCallback((key: string): string => {
    if (locale === 'he' && heTranslations[key]) {
      return heTranslations[key]
    }
    // For English, return the last segment of the key as a readable fallback
    const segments = key.split('.')
    return segments[segments.length - 1]
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isRTL, dir, t }}>
      {children}
    </LocaleContext.Provider>
  )
}
