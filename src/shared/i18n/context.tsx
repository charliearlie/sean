"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

type Locale = "en" | "ar";
type Direction = "ltr" | "rtl";

const dictionaries: Record<Locale, Record<string, string>> = { en, ar };

interface LocaleContextValue {
  locale: Locale;
  direction: Direction;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  direction: "ltr",
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale = "en",
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `pep-locale=${l};path=/;max-age=31536000`;
      setLocaleState(l);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({
      locale,
      direction: (locale === "ar" ? "rtl" : "ltr") as Direction,
      setLocale,
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  const { locale } = useContext(LocaleContext);
  const dict = dictionaries[locale];
  return useCallback(
    (key: string): string => {
      return dict[key] ?? key;
    },
    [dict]
  );
}
