"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/shared/context/CartContext";
import { LocaleProvider } from "@/shared/i18n/context";

export default function Providers({
  locale,
  children,
}: {
  locale: "en" | "ar";
  children: ReactNode;
}) {
  return (
    <CartProvider>
      <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
    </CartProvider>
  );
}
