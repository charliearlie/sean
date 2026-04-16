"use client";

import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeIn } from "@/lib/motion";
import type { Category } from "@/shared/types/product";
import { useLocale, useT } from "@/shared/i18n/context";
import { getLocalizedCategory } from "@/shared/i18n/product-data";
import { useColors, useTheme } from "@/shared/context/ThemeContext";

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
  const { theme } = useTheme();

  const glassBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    fontFamily: typography.monoFont,
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: isActive ? colors.accent : colors.mutedForeground,
    background: isActive ? "rgba(0, 255, 178, 0.08)" : "transparent",
    border: isActive ? `1px solid ${colors.accent}40` : `1px solid transparent`,
    borderRadius: "999px",
    padding: "8px 18px",
    cursor: "pointer",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease-in-out",
    ...(isActive ? { boxShadow: "0 0 16px rgba(0, 255, 178, 0.15)" } : {}),
  });

  return (
    <motion.div
      variants={fadeIn(motionTokens.duration, motionTokens.ease)}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex",
        gap: "8px",
        paddingBottom: "16px",
        overflowX: "auto",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => onSelect(undefined)}
        style={getTabStyle(!activeSlug)}
        onMouseEnter={(e) => {
          if (activeSlug) {
            (e.currentTarget as HTMLElement).style.color = colors.foreground;
            (e.currentTarget as HTMLElement).style.borderColor = glassBorder;
          }
        }}
        onMouseLeave={(e) => {
          if (activeSlug) {
            (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
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
            style={getTabStyle(isActive)}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.foreground;
                (e.currentTarget as HTMLElement).style.borderColor = glassBorder;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
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
