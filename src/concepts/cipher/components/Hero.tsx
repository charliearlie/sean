"use client";

import Link from "next/link";
import Image from "next/image";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { useLocale, useT } from "@/shared/i18n/context";
import { useColors, useTheme } from "@/shared/context/ThemeContext";
import type { Product } from "@/shared/types/product";

const { typography } = cipherTokens;

interface HeroProps {
  featured: Product[];
  spotlight?: Product;
}

export default function Hero({ featured, spotlight: spotlightProp }: HeroProps) {
  const { direction } = useLocale();
  const t = useT();
  const colors = useColors();
  const { theme } = useTheme();
  const isRtl = direction === "rtl";

  const spotlight = spotlightProp ?? featured[0];
  const spotlightImg =
    theme === "dark" && spotlight?.imageUrlDark
      ? spotlight.imageUrlDark
      : spotlight?.imageUrl;
  const spotlightMinPrice = spotlight
    ? Math.min(...spotlight.variants.map((v) => v.price))
    : null;

  return (
    <section
      style={{
        position: "relative",
        minHeight: "min(70vh, 560px)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: colors.background,
        animation: "heroFadeIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 768px) {
          .hero-columns {
            flex-direction: column !important;
          }
          .hero-left {
            width: 100% !important;
            text-align: center !important;
            padding-top: 80px !important;
            padding-bottom: 24px !important;
          }
          .hero-right {
            width: 100% !important;
            height: 280px !important;
            margin-top: 16px !important;
            margin-bottom: 40px !important;
          }
          .hero-cta-row {
            justify-content: center !important;
          }
          .hero-trust-list {
            align-items: center !important;
          }
        }
      `}</style>

      <div
        className="hero-columns"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 24px 60px",
          width: "100%",
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {/* Left column */}
        <div
          className="hero-left"
          style={{
            width: "55%",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <h1
            style={{
              fontFamily: typography.headingFont,
              fontSize: "clamp(28px, 4.5vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: colors.foreground,
              letterSpacing: "-0.01em",
              marginBottom: "24px",
            }}
          >
            {t("hero.line1")}
            <br />
            <span style={{ color: colors.accent }}>{t("hero.line2")}</span>
          </h1>

          <ul
            className="hero-trust-list"
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 32px 0",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {["hero.trust1", "hero.trust2", "hero.trust3"].map((key) => (
              <li
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: colors.mutedForeground,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: colors.accent, fontSize: "16px" }}>✓</span>
                {t(key)}
              </li>
            ))}
          </ul>

          <div
            className="hero-cta-row"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/shop"
              prefetch={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontFamily: typography.headingFont,
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: colors.accentForeground,
                background: colors.accent,
                padding: "14px 28px",
                border: "none",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = colors.accent;
                (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.accent}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = colors.accent;
                (e.currentTarget as HTMLElement).style.color = colors.accentForeground;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {t("hero.cta")}
            </Link>

            <Link
              href="/shop"
              prefetch={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontFamily: typography.headingFont,
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: colors.mutedForeground,
                background: "transparent",
                padding: "14px 28px",
                border: `1px solid ${colors.border}`,
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = colors.accent;
                (e.currentTarget as HTMLElement).style.color = colors.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
              }}
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>

        {/* Right column — featured product spotlight */}
        <div
          className="hero-right"
          style={{
            width: "45%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {spotlight && (
            <Link
              href={`/product/${spotlight.slug}`}
              prefetch={false}
              style={{ textDecoration: "none" }}
            >
              <div
                className="hero-spotlight-card"
                style={{
                  width: "360px",
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.25)";
                  (e.currentTarget as HTMLElement).style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "360px",
                    height: "380px",
                    background: colors.muted,
                  }}
                >
                  {spotlightImg && (
                    <Image
                      src={spotlightImg}
                      alt={spotlight.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 360px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "13px",
                      letterSpacing: "0.1em",
                      color: colors.foreground,
                      margin: 0,
                    }}
                  >
                    {spotlight.name}
                  </p>
                  {spotlightMinPrice !== null && (
                    <p
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: "11px",
                        color: colors.mutedForeground,
                        margin: "4px 0 0",
                      }}
                    >
                      From AED {spotlightMinPrice}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
