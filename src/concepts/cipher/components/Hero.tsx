"use client";

import Link from "next/link";
import Image from "next/image";
import { cipherTokens, glowEffects } from "@/concepts/cipher/tokens";
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

  const glassBg = theme === "dark"
    ? "rgba(15, 19, 24, 0.6)"
    : "rgba(248, 249, 251, 0.6)";
  const glassBorder = theme === "dark"
    ? "1px solid rgba(255, 255, 255, 0.08)"
    : "1px solid rgba(0, 0, 0, 0.06)";

  return (
    <section
      style={{
        position: "relative",
        minHeight: "min(80vh, 640px)",
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @media (max-width: 768px) {
          .hero-columns {
            flex-direction: column !important;
          }
          .hero-left {
            width: 100% !important;
            text-align: center !important;
            padding-top: 100px !important;
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
          .hero-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            max-width: 100% !important;
          }
          .hero-badge {
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>

      {/* Floating decoration orbs */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 255, 178, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 255, 178, 0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
          animation: "float 6s ease-in-out infinite 2s",
        }}
      />

      <div
        className="hero-columns"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "100px 24px 80px",
          width: "100%",
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: "48px",
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
          {/* Badge */}
          <div
            className="hero-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              background: "rgba(0, 255, 178, 0.1)",
              border: "1px solid rgba(0, 255, 178, 0.2)",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colors.accent,
                boxShadow: "0 0 8px rgba(0, 255, 178, 0.6)",
              }}
            />
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                letterSpacing: "0.15em",
                color: colors.accent,
                textTransform: "uppercase",
              }}
            >
              {t("hero.badge")}
            </span>
          </div>

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
            <span style={{ color: colors.accent, textShadow: glowEffects.text }}>
              {t("hero.line2")}
            </span>
          </h1>

          {/* Stats grid */}
          <div
            className="hero-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "32px",
              maxWidth: "440px",
            }}
          >
            {[
              { valueKey: "hero.stat1Value", labelKey: "hero.stat1Label" },
              { valueKey: "hero.stat2Value", labelKey: "hero.stat2Label" },
              { valueKey: "hero.stat3Value", labelKey: "hero.stat3Label" },
            ].map(({ valueKey, labelKey }) => (
              <div
                key={valueKey}
                style={{
                  background: glassBg,
                  backdropFilter: "blur(12px)",
                  border: glassBorder,
                  borderRadius: "12px",
                  padding: "16px 12px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.accent,
                    margin: 0,
                    textShadow: glowEffects.textSubtle,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(valueKey)}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: colors.mutedForeground,
                    margin: "4px 0 0",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(labelKey)}
                </p>
              </div>
            ))}
          </div>

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
                borderRadius: "8px",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.3s ease-in-out",
                boxShadow: glowEffects.button,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = colors.accent;
                (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 2px ${colors.accent}, ${glowEffects.button}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = colors.accent;
                (e.currentTarget as HTMLElement).style.color = colors.accentForeground;
                (e.currentTarget as HTMLElement).style.boxShadow = glowEffects.button;
              }}
            >
              {t("hero.cta")}
            </Link>

            <Link
              href="/shop"
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
                borderRadius: "8px",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.3s ease-in-out",
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
              style={{ textDecoration: "none" }}
            >
              <div
                className="hero-spotlight-card"
                style={{
                  width: "360px",
                  background: glassBg,
                  backdropFilter: "blur(16px)",
                  border: glassBorder,
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0, 255, 178, 0.2), 0 12px 40px rgba(0,0,0,0.3)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "360px",
                    height: "380px",
                    background: colors.muted,
                    borderRadius: "16px 16px 0 0",
                    overflow: "hidden",
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
                <div style={{ padding: "20px" }}>
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
                        fontSize: "12px",
                        color: colors.accent,
                        margin: "6px 0 0",
                        fontWeight: 600,
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
