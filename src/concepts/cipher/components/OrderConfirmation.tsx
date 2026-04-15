"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/shared/context/CartContext";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import type { CartItem } from "@/shared/types/cart";
import { useLocale, useT } from "@/shared/i18n/context";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

const SHIPPING_AED = 25;
const WHATSAPP_NUMBER = "971000000000";

export default function OrderConfirmation() {
  const { state, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [frozenItems, setFrozenItems] = useState<CartItem[]>([]);
  const [frozenTotal, setFrozenTotal] = useState<number>(0);
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

  useEffect(() => {
    // Capture items before clearing
    const items = state.items;
    const total = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
    setFrozenItems(items);
    setFrozenTotal(total);
    setOrderNumber(`ORD-${Date.now().toString(36).toUpperCase()}`);
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grandTotal = frozenTotal + SHIPPING_AED;

  const whatsappMessage = encodeURIComponent(
    locale === "ar"
      ? `السلام عليكم، أود الاستفسار عن طلبي ${orderNumber}. يرجى تأكيد الاستلام وموعد الإرسال المتوقع.`
      : `As-salamu alaykum, I would like to inquire about my order ${orderNumber}. Please confirm receipt and estimated dispatch.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      <style jsx global>{`
        @keyframes cipher-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Status header */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: "16px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ ...labelStyle, marginBottom: "6px" }}>{t("confirmation.transactionComplete")}</p>
          <h1
            style={{
              fontFamily: typography.monoFont,
              fontSize: "22px",
              fontWeight: 700,
              color: colors.accent,
              letterSpacing: "0.05em",
            }}
          >
            {t("confirmation.orderConfirmed")}
          </h1>
        </div>
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: "10px",
            color: "#22c55e",
            letterSpacing: "0.15em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              animation: "cipher-blink 1.5s ease-in-out infinite",
            }}
          />
          {t("confirmation.batchProcessing")}
        </div>
      </div>

      {/* Receipt block */}
      <div
        style={{
          border: `1px solid ${colors.border}`,
          background: colors.card,
          marginBottom: "24px",
        }}
      >
        {/* Receipt header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px dashed ${colors.border}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <p style={{ ...labelStyle, marginBottom: "4px" }}>{t("confirmation.orderReference")}</p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "14px",
                color: colors.accent,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {orderNumber || "—"}
            </p>
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: "4px" }}>{t("confirmation.date")}</p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
              }}
            >
              {new Date().toISOString().split("T")[0]}
            </p>
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: "4px" }}>{t("confirmation.status")}</p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: "#22c55e",
                letterSpacing: "0.1em",
              }}
            >
              {t("confirmation.queuedForDispatch")}
            </p>
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: "4px" }}>{t("confirmation.coaBatch")}</p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: colors.cardForeground,
              }}
            >
              {t("confirmation.pendingAllocation")}
            </p>
          </div>
        </div>

        {/* Items list */}
        <div style={{ borderBottom: `1px dashed ${colors.border}` }}>
          <div
            style={{
              padding: "8px 20px",
              background: colors.muted,
              borderBottom: `1px dashed ${colors.border}`,
              display: "grid",
              gridTemplateColumns: "1fr auto",
            }}
          >
            <span style={labelStyle}>{t("confirmation.compoundVariant")}</span>
            <span style={{ ...labelStyle, textAlign: "right" }}>{t("confirmation.amount")}</span>
          </div>

          {frozenItems.length === 0 ? (
            <div style={{ padding: "20px" }}>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  color: colors.mutedForeground,
                }}
              >
                {t("confirmation.noItems")}
              </p>
            </div>
          ) : (
            frozenItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px dashed ${colors.border}`,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "9px",
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
                      marginBottom: "2px",
                    }}
                  >
                    {item.product.name}
                  </p>
                  <p
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "9px",
                      color: colors.mutedForeground,
                    }}
                  >
                    {item.variant.dosage} × {item.quantity} — SKU: {item.variant.sku}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "12px",
                    color: colors.foreground,
                    fontWeight: 600,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatAED(item.variant.price * item.quantity, locale)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "10px",
                color: colors.mutedForeground,
                letterSpacing: "0.1em",
              }}
            >
              {t("confirmation.subtotal")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
              }}
            >
              {formatAED(frozenTotal, locale)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "14px",
              paddingBottom: "14px",
              borderBottom: `1px dashed ${colors.border}`,
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "10px",
                color: colors.mutedForeground,
                letterSpacing: "0.1em",
              }}
            >
              {t("confirmation.shipping")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
              }}
            >
              {formatAED(SHIPPING_AED, locale)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "13px",
                color: colors.foreground,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {t("confirmation.total")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "18px",
                color: colors.accent,
                fontWeight: 700,
              }}
            >
              {formatAED(grandTotal, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div
        style={{
          border: `1px solid ${colors.border}`,
          padding: "16px 20px",
          marginBottom: "24px",
          background: colors.muted,
        }}
      >
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "10px",
            color: colors.mutedForeground,
            letterSpacing: "0.1em",
            lineHeight: 1.7,
          }}
        >
          {t("confirmation.batchMsg1")}
          <br />
          {t("confirmation.batchMsg2")}
          <br />
          {t("confirmation.batchMsg3")}
          <br />
          {t("confirmation.batchMsg4")}
        </p>
      </div>

      {/* CTA buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            fontFamily: typography.monoFont,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "14px 24px",
            background: "#25d366",
            color: "#0a0d12",
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          {t("confirmation.whatsappInquiry")}
        </a>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/shop"
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              fontFamily: typography.monoFont,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              padding: "12px 16px",
              background: "transparent",
              color: colors.accent,
              textDecoration: "none",
              textTransform: "uppercase",
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
            {t("confirmation.continueResearch")}
          </Link>

          <Link
            href="/"
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              fontFamily: typography.monoFont,
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.15em",
              padding: "12px 16px",
              background: "transparent",
              color: colors.mutedForeground,
              textDecoration: "none",
              textTransform: "uppercase",
              border: `1px solid ${colors.border}`,
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = colors.foreground;
              (e.currentTarget as HTMLElement).style.color = colors.foreground;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = colors.border;
              (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
            }}
          >
            {t("confirmation.returnToBase")}
          </Link>
        </div>
      </div>
    </div>
  );
}
