import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import Providers from "./Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://purepeptides.ae"),
  title: "Pure Peptides | Premium Research Compounds",
  description:
    "UAE-based premium research compounds. HPLC-verified with Certificate of Analysis. For research purposes only.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Pure Peptides | Premium Research Compounds",
    description:
      "UAE-based premium research compounds. HPLC-verified with Certificate of Analysis. For research purposes only.",
    siteName: "Pure Peptides",
    type: "website",
    locale: "en_AE",
    images: [{ url: "/logo.png", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pure Peptides | Premium Research Compounds",
    description:
      "UAE-based premium research compounds. HPLC-verified with Certificate of Analysis. For research purposes only.",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("pep-locale")?.value === "ar" ? "ar" : "en") as "en" | "ar";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${notoKufiArabic.variable} antialiased`}
      >
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
