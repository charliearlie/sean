"use client";

import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeIn } from "@/lib/motion";
import type { Category } from "@/shared/types/product";
import { useLocale, useT } from "@/shared/i18n/context";
import { getLocalizedCategory } from "@/shared/i18n/product-data";
import { useColors } from "@/shared/context/ThemeContext";

const { typography, motion: motionTokens } = cipherTokens;

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
  onSelect: (slug: string | undefined) => void;
}

export default function CategoryNav({
  categories,
  activeSlug,
  onSelect,
}: CategoryNavProps) {
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();
  return (
    <motion.div
      variants={fadeIn(motionTokens.duration, motionTokens.ease)}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex",
        gap: "0px",
        borderBottom: `1px solid ${colors.border}`,
        overflowX: "auto",
      }}
    >
      <button
        onClick={() => onSelect(undefined)}
        style={{
          fontFamily: typography.monoFont,
          fontSize: "11px",
          letterSpacing: "0.12em",
          color: !activeSlug ? colors.accent : colors.mutedForeground,
          background: "transparent",
          border: "none",
          borderBottom: !activeSlug
            ? `2px solid ${colors.accent}`
            : "2px solid transparent",
          padding: "12px 20px",
          cursor: "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          if (activeSlug) {
            (e.currentTarget as HTMLElement).style.color = colors.foreground;
          }
        }}
        onMouseLeave={(e) => {
          if (activeSlug) {
            (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
          }
        }}
      >
        {t("shop.allCompounds")}
      </button>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              letterSpacing: "0.12em",
              color: isActive ? colors.accent : colors.mutedForeground,
              background: "transparent",
              border: "none",
              borderBottom: isActive
                ? `2px solid ${colors.accent}`
                : "2px solid transparent",
              padding: "12px 20px",
              cursor: "pointer",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.foreground;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
              }
            }}
          >
            {getLocalizedCategory(cat, locale).name}
          </button>
        );
      })}
    </motion.div>
  );
}
