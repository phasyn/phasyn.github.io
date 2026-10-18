import { createContext, use, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from '../site/config.ts';

/**
 * Copy for one feature: every locale is required by the type, so a missing
 * translation fails `tsc` instead of shipping an empty string.
 */
export type Copy<T> = Record<Locale, T>;

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return use(LocaleContext);
}

/** Pick this page's locale from a feature's copy object. */
export function useCopy<T>(copy: Copy<T>): T {
  return copy[useLocale()];
}
