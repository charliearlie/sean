"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cipherTokens, glowEffects } from "@/concepts/cipher/tokens";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import Hero from "@/concepts/cipher/components/Hero";
import ProductGrid from "@/concepts/cipher/components/ProductGrid";
import MotionWrapper from "@/concepts/cipher/components/MotionWrapper";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import Link from "next/link";
import { useLocale, useT } from "@/shared/i18n/context";
import { getLocalizedCategory } from "@/shared/i18n/product-data";
import { useColors, useTheme } from "@/shared/context/ThemeContext";
import type { Product, Category } from "@/shared/types/product";

const { typography, motion: motionTokens } = cipherTokens;

function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <p
      style={{
        fontFamily: typography.monoFont,
        fontSize: "11px",
        letterSpacing: "0.2em",
        color: colors.accent,
        textTransform: "uppercase",
        marginBottom: "12px",
      }}
    >
      {children}
    </p>
  );
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();
  const { theme } = useTheme();

  const glassBg = theme === "dark"
    ? "rgba(15, 19, 24, 0.4)"
    : "rgba(248, 249, 251, 0.4)";
  const glassBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "96px 24px",
      }}
    >
      <MotionWrapper>
        <SectionLabel>COMPOUND INDEX</SectionLabel>
        <h2
          style={{
            fontFamily: typography.headingFont,
            fontSize: "24px",
            fontWeight: 700,
            color: colors.foreground,
            marginBottom: "40px",
            textShadow: glowEffects.textSubtle,
          }}
        >
          {t("home.compoundIndex")}
        </h2>
      </MotionWrapper>

      <motion.div
        variants={staggerContainer(motionTokens.staggerChildren)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {categories.map((cat) => {
          const localized = getLocalizedCategory(cat, locale);
          return (
            <motion.div
              key={cat.id}
              variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                style={{
                  display: "block",
                  height: "100%",
                  padding: "28px 24px",
                  textDecoration: "none",
                  background: glassBg,
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${glassBorder}`,
                  borderRadius: "12px",
                  transition: "all 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0, 255, 178, 0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 255, 178, 0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = glassBg;
                  (e.currentTarget as HTMLElement).style.borderColor = glassBorder;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "8px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: colors.foreground,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {localized.name}
                  </p>
                  <span
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "10px",
                      color: colors.accent,
                    }}
                  >
                    {cat.productCount} {t("home.compounds")}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: colors.mutedForeground,
                    lineHeight: 1.6,
                  }}
                >
                  {localized.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

function FeaturedSection({ featured }: { featured: Product[] }) {
  const t = useT();
  const colors = useColors();

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <MotionWrapper>
        <SectionLabel>FEATURED COMPOUNDS</SectionLabel>
        <h2
          style={{
            fontFamily: typography.headingFont,
            fontSize: "24px",
            fontWeight: 700,
            color: colors.foreground,
            marginBottom: "40px",
            textShadow: glowEffects.textSubtle,
          }}
        >
          {t("home.featuredTitle")}
        </h2>
      </MotionWrapper>
      <ProductGrid products={featured} />
    </section>
  );
}

function FeaturesSection() {
  const t = useT();
  const colors = useColors();
  const { theme } = useTheme();

  const glassBg = theme === "dark"
    ? "rgba(15, 19, 24, 0.5)"
    : "rgba(248, 249, 251, 0.5)";
  const glassBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";

  const items = [
    { titleKey: "home.cred.hplc.title", detailKey: "home.cred.hplc.detail", icon: "🔬" },
    { titleKey: "home.cred.coa.title", detailKey: "home.cred.coa.detail", icon: "📋" },
    { titleKey: "home.cred.iso.title", detailKey: "home.cred.iso.detail", icon: "🏭" },
    { titleKey: "home.cred.gcc.title", detailKey: "home.cred.gcc.detail", icon: "❄️" },
  ];

  return (
    <section id="about">
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "96px 24px",
        }}
      >
        <style>{`
          .features-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          @media (max-width: 1024px) {
            .features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 640px) {
            .features-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <MotionWrapper>
          <SectionLabel>QUALITY ASSURANCE</SectionLabel>
          <h2
            style={{
              fontFamily: typography.headingFont,
              fontSize: "24px",
              fontWeight: 700,
              color: colors.foreground,
              marginBottom: "40px",
              textShadow: glowEffects.textSubtle,
            }}
          >
            {t("home.verificationTitle")}
          </h2>
        </MotionWrapper>

        <motion.div
          className="features-grid"
          variants={staggerContainer(motionTokens.staggerChildren)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {items.map(({ titleKey, detailKey, icon }) => (
            <motion.div
              key={titleKey}
              variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
              style={{
                background: glassBg,
                backdropFilter: "blur(8px)",
                border: `1px solid ${glassBorder}`,
                borderRadius: "12px",
                padding: "28px 24px",
                transition: "border-color 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 255, 178, 0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = glassBorder;
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(0, 255, 178, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  fontSize: "20px",
                }}
              >
                {icon}
              </div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: colors.foreground,
                  marginBottom: "8px",
                }}
              >
                {t(titleKey)}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: colors.mutedForeground,
                  lineHeight: 1.7,
                }}
              >
                {t(detailKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const t = useT();
  const colors = useColors();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");

  const glassBg = theme === "dark"
    ? "rgba(15, 19, 24, 0.6)"
    : "rgba(248, 249, 251, 0.6)";
  const glassBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.06)";
  const inputBg = theme === "dark"
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)";
  const inputBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <MotionWrapper>
        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "48px",
            borderRadius: "16px",
            background: glassBg,
            backdropFilter: "blur(16px)",
            border: `1px solid ${glassBorder}`,
            textAlign: "center",
          }}
        >
          <SectionLabel>{t("home.newsletter.label")}</SectionLabel>
          <h2
            style={{
              fontFamily: typography.headingFont,
              fontSize: "24px",
              fontWeight: 700,
              color: colors.foreground,
              marginBottom: "12px",
              textShadow: glowEffects.textSubtle,
            }}
          >
            {t("home.newsletter.title")}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: colors.mutedForeground,
              lineHeight: 1.6,
              marginBottom: "24px",
              maxWidth: "440px",
              margin: "0 auto 24px",
            }}
          >
            {t("home.newsletter.subtitle")}
          </p>

          <style>{`
            @media (max-width: 640px) {
              .newsletter-row {
                flex-direction: column !important;
              }
            }
          `}</style>

          <div
            className="newsletter-row"
            style={{
              display: "flex",
              gap: "12px",
              maxWidth: "440px",
              margin: "0 auto",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("home.newsletter.placeholder")}
              style={{
                flex: 1,
                fontFamily: typography.monoFont,
                fontSize: "13px",
                padding: "14px 20px",
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: "8px",
                color: colors.foreground,
                outline: "none",
                transition: "border-color 0.2s ease-in-out",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = colors.accent + "40";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = inputBorder;
              }}
            />
            <button
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                color: colors.accentForeground,
                background: colors.accent,
                border: "none",
                borderRadius: "8px",
                padding: "14px 24px",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.3s ease-in-out",
                boxShadow: glowEffects.button,
                whiteSpace: "nowrap",
              }}
            >
              {t("home.newsletter.button")}
            </button>
          </div>
        </div>
      </MotionWrapper>
    </section>
  );
}

interface HomeContentProps {
  featured: Product[];
  categories: Category[];
  mostPopular?: Product | null;
}

export default function HomeContent({ featured, categories, mostPopular }: HomeContentProps) {
  return (
    <>
      <Hero featured={featured} spotlight={mostPopular ?? undefined} />
      <FeaturedSection featured={featured} />
      <FeaturesSection />
      <CategoriesSection categories={categories} />
      <NewsletterSection />
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 40px",
        }}
      >
        <ResearchDisclaimer />
      </div>
    </>
  );
}
