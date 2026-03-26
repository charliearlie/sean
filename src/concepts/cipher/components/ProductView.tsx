"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/motion";
import { formatAED } from "@/shared/utils/currency";
import type { Product } from "@/shared/types/product";
import ProductCard from "@/concepts/cipher/components/ProductCard";
import { useCart } from "@/shared/context/CartContext";
import { useLocale, useT } from "@/shared/i18n/context";
import { borderInlineEnd, textAlignStart, insetInlineStart } from "@/shared/i18n/rtl-helpers";
import { getLocalizedProduct } from "@/shared/i18n/product-data";
import { useTheme, useColors } from "@/shared/context/ThemeContext";

const { typography, motion: motionTokens } = cipherTokens;

interface ProductViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductView({ product, relatedProducts }: ProductViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const variant = product.variants[selectedVariant];
  const anyInStock = product.variants.some((v) => v.inStock);
  const { state, addItem, updateQuantity } = useCart();
  const { locale, direction } = useLocale();
  const t = useT();
  const lp = getLocalizedProduct(product, locale);
  const { theme } = useTheme();
  const colors = useColors();
  const selectedVariantId = variant?.id;
  const cartItem = state.items.find(
    (i) => i.productId === product.id && i.variantId === selectedVariantId
  );

  const imgSrc = theme === "dark"
    ? (product.imageUrlDark || product.imageUrl)
    : (product.imageUrl || product.imageUrlDark);

  return (
    <div style={{ paddingTop: "56px" }}>
      <style jsx global>{`
        @media (max-width: 768px) {
          .cipher-product-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .cipher-product-image {
            min-height: 300px;
            border-right: none !important;
          }
          .cipher-product-info {
            padding: 24px 20px !important;
          }
          .cipher-related-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1200px) {
          .cipher-product-grid {
            grid-template-columns: minmax(0, 480px) 1fr !important;
          }
        }
      `}</style>
      {/* Top section: image + info */}
      <div
        className="cipher-product-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0px",
        }}
      >
        {/* Image area */}
        <motion.div
          className="cipher-product-image"
          variants={fadeIn(motionTokens.duration, motionTokens.ease)}
          initial="hidden"
          animate="visible"
          style={{
            position: "relative",
            background: colors.muted,
            ...borderInlineEnd(direction, `1px solid ${colors.border}`),
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={imgSrc || undefined}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "20px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "24px",
              ...insetInlineStart(direction, "24px"),
              fontFamily: typography.monoFont,
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: colors.mutedForeground,
            }}
          >
            {product.coaBatchNumber}
          </div>
        </motion.div>

        {/* Info area */}
        <motion.div
          className="cipher-product-info"
          variants={staggerContainer(motionTokens.staggerChildren)}
          initial="hidden"
          animate="visible"
          style={{
            padding: "48px 40px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
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
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: colors.foreground,
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              {lp.name}
            </h1>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              border: `1px solid ${colors.border}`,
              marginBottom: "24px",
            }}
          >
            {[
              { label: t("product.purity"), value: `${product.purity}%` },
              { label: t("product.molWeight"), value: product.molecularWeight },
              { label: t("product.form"), value: product.formFactor },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "16px",
                  ...(i < 2 ? borderInlineEnd(direction, `1px solid ${colors.border}`) : {}),
                }}
              >
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: colors.foreground,
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Sequence */}
          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {t("product.sequence")}
            </p>
            <div
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.cardForeground,
                background: colors.muted,
                padding: "12px 16px",
                border: `1px solid ${colors.border}`,
                lineHeight: 1.8,
                wordBreak: "break-all",
                marginBottom: "24px",
              }}
            >
              {product.sequence}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeInUp(motionTokens.duration, motionTokens.ease)}>
            <p
              style={{
                fontSize: "14px",
                color: colors.cardForeground,
                lineHeight: 1.8,
                marginBottom: "32px",
              }}
            >
              {lp.longDescription}
            </p>
          </motion.div>

          {/* Variants table */}
          <motion.div
            variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
            style={{ marginBottom: "24px" }}
          >
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              {t("product.variants")}
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: typography.monoFont,
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {[t("product.sku"), t("product.dosage"), t("product.priceAed"), t("product.status")].map((h) => (
                    <th
                      key={h}
                      style={{
                        ...textAlignStart(direction),
                        padding: "8px 12px",
                        fontSize: "9px",
                        letterSpacing: "0.15em",
                        color: colors.mutedForeground,
                        fontWeight: 500,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v, i) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background:
                        selectedVariant === i
                          ? `${colors.accent}10`
                          : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease-in-out",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: colors.cardForeground,
                      }}
                    >
                      {v.sku}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: colors.foreground,
                        fontWeight: 600,
                      }}
                    >
                      {v.dosage}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: colors.foreground,
                        fontWeight: 600,
                      }}
                    >
                      {formatAED(v.price, locale)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: v.inStock ? "#22c55e" : "#ef4444",
                        fontSize: "10px",
                      }}
                    >
                      {v.inStock ? t("product.available") : t("product.unavailable")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Action row */}
          <motion.div
            variants={fadeInUp(motionTokens.duration, motionTokens.ease)}
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "auto",
            }}
          >
            {cartItem ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  padding: "14px 24px",
                  border: `1px solid ${colors.accent}`,
                }}
              >
                <button
                  onClick={() =>
                    updateQuantity(product.id, selectedVariantId, cartItem.quantity - 1)
                  }
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "16px",
                    lineHeight: 1,
                    width: "32px",
                    height: "32px",
                    background: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.mutedForeground,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease-in-out",
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
                  −
                </button>
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: colors.foreground,
                    letterSpacing: "0.1em",
                    minWidth: "28px",
                    textAlign: "center",
                  }}
                >
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(product.id, selectedVariantId, cartItem.quantity + 1)
                  }
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "16px",
                    lineHeight: 1,
                    width: "32px",
                    height: "32px",
                    background: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.mutedForeground,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease-in-out",
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
                  +
                </button>
              </div>
            ) : (
              <button
                disabled={!variant?.inStock}
                onClick={() => {
                  if (variant && variant.inStock) {
                    addItem(product, variant);
                  }
                }}
                style={{
                  flex: 1,
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  padding: "14px 24px",
                  background: variant?.inStock ? colors.accent : colors.muted,
                  color: variant?.inStock ? colors.accentForeground : colors.mutedForeground,
                  border: "none",
                  cursor: variant?.inStock ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  if (variant?.inStock) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = colors.accent;
                    (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.accent}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (variant?.inStock) {
                    (e.currentTarget as HTMLElement).style.background = colors.accent;
                    (e.currentTarget as HTMLElement).style.color = colors.accentForeground;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }
                }}
              >
                {`${t("product.addToCart")} — ${variant ? formatAED(variant.price, locale) : ""}`}
              </button>
            )}
            <button
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                letterSpacing: "0.1em",
                padding: "14px 20px",
                background: "transparent",
                color: colors.cardForeground,
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = colors.accent;
                (e.currentTarget as HTMLElement).style.color = colors.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                (e.currentTarget as HTMLElement).style.color = colors.cardForeground;
              }}
            >
              {t("product.downloadCoa")}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "64px 24px",
          }}
        >
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              letterSpacing: "0.25em",
              color: colors.mutedForeground,
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            {t("product.related")}
          </p>
          <motion.div
            className="cipher-related-grid"
            variants={staggerContainer(motionTokens.staggerChildren)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "0px",
            }}
          >
            {relatedProducts.slice(0, 3).map((rp) => (
              <div key={rp.id} style={{ border: `1px solid ${colors.border}` }}>
                <ProductCard product={rp} />
              </div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
