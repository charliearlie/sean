"use client";

import Link from "next/link";
import { useCart } from "@/shared/context/CartContext";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import { useLocale, useT } from "@/shared/i18n/context";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function CartView() {
  const { state, removeItem, updateQuantity, totalPrice } = useCart();
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();

  const labelStyle: React.CSSProperties = {
    fontFamily: typography.monoFont,
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: colors.mutedForeground,
    textTransform: "uppercase",
  };
  const items = state.items;

  if (items.length === 0) {
    return (
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "176px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "13px",
            letterSpacing: "0.15em",
            color: colors.mutedForeground,
            textTransform: "uppercase",
          }}
        >
          {t("cart.empty")}
        </p>
        <Link
          href="/shop"
          style={{
            fontFamily: typography.monoFont,
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: colors.accent,
            textDecoration: "none",
            textTransform: "uppercase",
            border: `1px solid ${colors.accent}`,
            padding: "10px 24px",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {t("cart.browseCatalogue")}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      <style jsx global>{`
        @media (max-width: 768px) {
          .cipher-cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: "16px",
          marginBottom: "32px",
        }}
      >
        <p style={{ ...labelStyle, marginBottom: "6px" }}>{t("cart.orderQueue")}</p>
        <h1
          style={{
            fontFamily: typography.monoFont,
            fontSize: "22px",
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: "0.05em",
          }}
        >
          {t("cart.title")}
        </h1>
      </div>

      <div
        className="cipher-cart-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Items table */}
        <div style={{ border: `1px solid ${colors.border}` }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 100px 40px",
              borderBottom: `1px solid ${colors.border}`,
              background: colors.muted,
            }}
          >
            {[t("cart.compound"), t("cart.variant"), t("cart.qty"), t("cart.total"), ""].map((h, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  ...labelStyle,
                  fontSize: "9px",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Item rows */}
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px 100px 40px",
                borderBottom: `1px solid ${colors.border}`,
                alignItems: "center",
              }}
            >
              {/* Compound */}
              <div style={{ padding: "16px 14px" }}>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "10px",
                    color: colors.accent,
                    letterSpacing: "0.12em",
                    marginBottom: "3px",
                  }}
                >
                  {item.product.compoundCode}
                </p>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "12px",
                    color: colors.foreground,
                    fontWeight: 600,
                  }}
                >
                  {item.product.name}
                </p>
              </div>

              {/* Variant dosage */}
              <div style={{ padding: "16px 14px" }}>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "11px",
                    color: colors.cardForeground,
                  }}
                >
                  {item.variant.dosage}
                </p>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "9px",
                    color: colors.mutedForeground,
                    letterSpacing: "0.1em",
                    marginTop: "2px",
                  }}
                >
                  {item.variant.sku}
                </p>
              </div>

              {/* Quantity controls */}
              <div
                style={{
                  padding: "16px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.variantId, item.quantity - 1)
                  }
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "14px",
                    lineHeight: 1,
                    width: "24px",
                    height: "24px",
                    background: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.mutedForeground,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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
                    fontSize: "13px",
                    color: colors.foreground,
                    fontWeight: 600,
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.variantId, item.quantity + 1)
                  }
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "14px",
                    lineHeight: 1,
                    width: "24px",
                    height: "24px",
                    background: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.mutedForeground,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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

              {/* Line total */}
              <div style={{ padding: "16px 14px" }}>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "12px",
                    color: colors.foreground,
                    fontWeight: 600,
                  }}
                >
                  {formatAED(item.variant.price * item.quantity, locale)}
                </p>
              </div>

              {/* Remove */}
              <div
                style={{
                  padding: "16px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "13px",
                    background: "transparent",
                    border: "none",
                    color: colors.mutedForeground,
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: "4px",
                    transition: "color 0.15s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                  }}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            background: colors.card,
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${colors.border}`,
              background: colors.muted,
            }}
          >
            <p style={labelStyle}>{t("cart.orderSummary")}</p>
          </div>

          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  color: colors.mutedForeground,
                  letterSpacing: "0.1em",
                }}
              >
                {t("cart.subtotal")}
              </span>
              <span
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  color: colors.foreground,
                  fontWeight: 600,
                }}
              >
                {formatAED(totalPrice, locale)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  color: colors.mutedForeground,
                  letterSpacing: "0.1em",
                }}
              >
                {t("cart.estShipping")}
              </span>
              <span
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  color: colors.foreground,
                }}
              >
                At checkout
              </span>
            </div>

            <Link
              href="/checkout"
              style={{
                display: "block",
                textAlign: "center",
                fontFamily: typography.monoFont,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                padding: "14px 24px",
                background: colors.accent,
                color: colors.accentForeground,
                textDecoration: "none",
                textTransform: "uppercase",
                marginBottom: "12px",
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
              {t("cart.checkout")}
            </Link>

            <Link
              href="/shop"
              style={{
                display: "block",
                textAlign: "center",
                fontFamily: typography.monoFont,
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: colors.mutedForeground,
                textDecoration: "none",
                textTransform: "uppercase",
                padding: "8px",
                transition: "color 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.foreground;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
              }}
            >
              {t("cart.continueArrow")} {t("cart.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
