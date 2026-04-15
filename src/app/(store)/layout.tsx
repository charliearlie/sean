import Nav from "@/concepts/cipher/components/Nav";
import Footer from "@/concepts/cipher/components/Footer";
import WhatsAppButton from "@/shared/components/WhatsAppButton";
import AiChatWidget from "@/shared/components/AiChatWidget";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import { ChatProductProvider } from "@/shared/context/ChatProductContext";
import StoreShell from "./StoreShell";

export const metadata = {
  title: "Pure Peptides | Precision Research Compounds",
  description:
    "UAE-based research supply. HPLC-verified compounds with Certificate of Analysis. For research use only.",
  openGraph: {
    title: "Pure Peptides | Precision Research Compounds",
    description:
      "UAE-based research supply. HPLC-verified compounds with Certificate of Analysis. For research use only.",
    siteName: "Pure Peptides",
    type: "website",
    locale: "en_AE",
    images: [{ url: "/logo.png", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Pure Peptides | Precision Research Compounds",
    description:
      "UAE-based research supply. HPLC-verified compounds with Certificate of Analysis. For research use only.",
    images: ["/logo.png"],
  },
};

export default function CipherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ChatProductProvider product={null}>
        <StoreShell>
          <ScrollToTop />
          <Nav />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
          <AiChatWidget />
        </StoreShell>
      </ChatProductProvider>
    </ThemeProvider>
  );
}
