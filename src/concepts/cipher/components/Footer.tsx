"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useLocale, useT } from "@/shared/i18n/context";
import { useColors } from "@/shared/context/ThemeContext";

const { typography, motion: motionTokens } = cipherTokens;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  const colors = useColors();
  const linkStyle = {
    fontSize: "13px",
    color: colors.cardForeground,
    textDecoration: "none",
    transition: "color 0.2s ease-in-out",
  };
  const onEnter = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.color = colors.accent;
  };
  const onLeave = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.color = colors.cardForeground;
  };
  return (
    <div>
      <p
        style={{
          fontFamily: typography.monoFont,
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: colors.mutedForeground,
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}

                style={linkStyle}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();

  const whatsappMessage = locale === "ar" ? t("whatsapp.footerMessage") : "As-salamu alaykum, I'd like to inquire about research peptides.";
  const whatsappUrl = `https://wa.me/971501234567?text=${encodeURIComponent(whatsappMessage)}`;

  const companyLinks = [
    { label: t("footer.about"), href: "/#about" },
    { label: t("footer.catalogue"), href: "/shop" },
    { label: t("footer.contact"), href: whatsappUrl, external: true },
  ];
  const researchLinks = [
    { label: t("footer.coaDb"), href: "/coa" },
    { label: t("footer.protocols"), href: "/protocols" },
    { label: t("footer.hplcReports"), href: "/hplc" },
  ];
  const legalLinks = [
    { label: t("footer.terms"), href: "/terms" },
    { label: t("footer.privacy"), href: "/privacy" },
    { label: t("footer.shipping"), href: "/shipping" },
  ];

  return (
    <footer
      id="contact"
      style={{
        background: colors.card,
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <motion.div
        variants={staggerContainer(motionTokens.staggerChildren)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: "48px",
          }}
        >
          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: colors.accent,
                marginBottom: "16px",
              }}
            >
              PURE PEPTIDES
            </p>
            <p
              style={{
                fontSize: "12px",
                color: colors.mutedForeground,
                lineHeight: 1.7,
                marginBottom: "20px",
                maxWidth: "280px",
              }}
            >
              {t("footer.address")}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: typography.monoFont,
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: colors.accent,
                textDecoration: "none",
                padding: "8px 16px",
                border: `1px solid ${colors.accent}`,
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = colors.accent;
                (e.currentTarget as HTMLElement).style.color = colors.accentForeground;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = colors.accent;
              }}
            >
              {t("footer.whatsapp")}
            </a>
          </motion.div>

          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <FooterColumn title={t("footer.company")} links={companyLinks} />
          </motion.div>

          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <FooterColumn title={t("footer.research")} links={researchLinks} />
          </motion.div>

          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <FooterColumn title={t("footer.legal")} links={legalLinks} />
          </motion.div>
        </div>

        <div style={{ marginTop: "48px" }}>
          <ResearchDisclaimer />
        </div>

        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            marginTop: "24px",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              color: colors.mutedForeground,
              letterSpacing: "0.1em",
            }}
          >
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              color: colors.mutedForeground,
              letterSpacing: "0.05em",
            }}
          >
            {t("footer.researchOnly")}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
