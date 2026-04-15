"use client";

import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import Hero from "@/concepts/cipher/components/Hero";
import ProductGrid from "@/concepts/cipher/components/ProductGrid";
import MotionWrapper from "@/concepts/cipher/components/MotionWrapper";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import Link from "next/link";
import { useLocale, useT } from "@/shared/i18n/context";
import { getLocalizedCategory } from "@/shared/i18n/product-data";
import { useColors } from "@/shared/context/ThemeContext";
import type { Product, Category } from "@/shared/types/product";

const { typography, motion: motionTokens } = cipherTokens;

interface HomeContentProps {
  featured: Product[];
  categories: Category[];
  mostPopular?: Product | null;
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px",
      }}
    >
      <MotionWrapper>
        <h2
          style={{
            fontFamily: typography.headingFont,
            fontSize: "24px",
            fontWeight: 700,
            color: colors.foreground,
            marginBottom: "40px",
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
          gap: "0px",
          border: `1px solid ${colors.border}`,
        }}
      >
        {categories.map((cat) => {
          const localized = getLocalizedCategory(cat, locale);
          return (
            <motion.div
              key={cat.id}
              variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
              style={{
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}

                style={{
                  display: "block",
                  height: "100%",
                  padding: "28px 24px",
                  textDecoration: "none",
                  transition: "background 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.muted;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
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
        padding: "0 24px 80px",
      }}
    >
      <MotionWrapper>
        <h2
          style={{
            fontFamily: typography.headingFont,
            fontSize: "24px",
            fontWeight: 700,
            color: colors.foreground,
            marginBottom: "40px",
          }}
        >
          {t("home.featuredTitle")}
        </h2>
      </MotionWrapper>
      <ProductGrid products={featured} />
    </section>
  );
}

function TrustBar() {
  const t = useT();
  const colors = useColors();

  const items = [
    t("home.cred.hplc.title"),
    t("home.cred.coa.title"),
    t("home.cred.iso.title"),
    t("home.cred.gcc.title"),
  ];

  return (
    <section id="about">
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          background: colors.card,
        }}
      >
        <div
          className="trust-bar-inner"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "24px",
          }}
        >
          <style>{`
            .trust-bar-items {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              flex-wrap: wrap;
            }
            @media (max-width: 768px) {
              .trust-bar-items {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 16px !important;
              }
            }
          `}</style>

          <MotionWrapper>
            <h2
              style={{
                fontFamily: typography.headingFont,
                fontSize: "18px",
                fontWeight: 700,
                color: colors.foreground,
                marginBottom: "20px",
              }}
            >
              {t("home.verificationTitle")}
            </h2>
          </MotionWrapper>

          <div className="trust-bar-items">
            {items.map((title) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: "1 1 auto",
                }}
              >
                <span style={{ color: colors.accent, fontSize: "16px", flexShrink: 0 }}>✓</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: colors.foreground,
                  }}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeContent({ featured, categories, mostPopular }: HomeContentProps) {
  return (
    <>
      <Hero featured={featured} spotlight={mostPopular ?? undefined} />
      <FeaturedSection featured={featured} />
      <TrustBar />
      <CategoriesSection categories={categories} />
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
