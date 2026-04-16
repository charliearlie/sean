"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cipherTokens, glowEffects } from "@/concepts/cipher/tokens";
import { fadeInUp } from "@/lib/motion";
import { formatAED } from "@/shared/utils/currency";
import type { Product } from "@/shared/types/product";
import { useLocale, useT } from "@/shared/i18n/context";
import { getLocalizedProduct } from "@/shared/i18n/product-data";
import { useTheme, useColors } from "@/shared/context/ThemeContext";

const { typography, motion: motionTokens } = cipherTokens;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { locale } = useLocale();
  const t = useT();
  const lp = getLocalizedProduct(product, locale);
  const { theme } = useTheme();
  const colors = useColors();

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const anyInStock = product.variants.some((v) => v.inStock);

  const imgSrc = theme === "dark"
    ? (product.imageUrlDark || product.imageUrl)
    : (product.imageUrl || product.imageUrlDark);

  const glassBg = theme === "dark"
    ? "rgba(15, 19, 24, 0.5)"
    : "rgba(248, 249, 251, 0.5)";
  const glassBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";
  const subtleBorder = theme === "dark"
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.04)";

  return (
    <motion.div
      variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        border: `1px solid ${hovered ? colors.accent + "40" : glassBorder}`,
        background: glassBg,
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        boxShadow: hovered ? glowEffects.cardHover : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {/* Header row - compound code + stock */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: `1px solid ${subtleBorder}`,
          }}
        >
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: colors.accent,
            }}
          >
            {product.compoundCode}
          </span>
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.1em",
              color: anyInStock ? "#22c55e" : "#ef4444",
              textTransform: "uppercase",
            }}
          >
            {anyInStock ? `● ${t("product.inStock")}` : `● ${t("product.outOfStock")}`}
          </span>
        </div>

        {/* Image area */}
        <div
          style={{
            position: "relative",
            height: "240px",
            overflow: "hidden",
            borderBottom: `1px solid ${subtleBorder}`,
            background: colors.muted,
          }}
        >
          <Image
            src={imgSrc || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              transition: "transform 0.5s ease-in-out",
              ...(hovered ? { transform: "scale(1.05)" } : {}),
            }}
          />
        </div>

        {/* Data rows */}
        <div style={{ padding: "20px" }}>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: colors.foreground,
              marginBottom: "4px",
            }}
          >
            {lp.name}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: colors.mutedForeground,
              marginBottom: "12px",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {lp.description}
          </p>

          {/* Price + batch row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingTop: "12px",
              borderTop: `1px solid ${subtleBorder}`,
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "15px",
                fontWeight: 600,
                color: colors.accent,
              }}
            >
              {minPrice === maxPrice
                ? formatAED(minPrice, locale)
                : `${formatAED(minPrice, locale)} – ${formatAED(maxPrice, locale)}`}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                color: colors.mutedForeground,
                letterSpacing: "0.05em",
              }}
            >
              {product.coaBatchNumber}
            </span>
          </div>
        </div>

        {/* Hover sliding description panel */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: hovered ? "0%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(180deg, transparent 0%, ${colors.card}f0 20%, ${colors.card} 100%)`,
            padding: "40px 20px 20px",
            pointerEvents: "none",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: colors.accent,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {product.formFactor} · {product.molecularWeight}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: colors.cardForeground,
              lineHeight: 1.6,
            }}
          >
            {lp.description}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
