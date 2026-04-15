"use client";

import Link from "next/link";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import { useLocale, useT } from "@/shared/i18n/context";
import { textAlignEnd } from "@/shared/i18n/rtl-helpers";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  payment_processing: "#3b82f6",
  paid: "#22c55e",
  confirmed: "#22c55e",
  preparing: "#8b5cf6",
  shipped: "#06b6d4",
  out_for_delivery: "#06b6d4",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#f59e0b",
};

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
}

interface OrderHistoryProps {
  orders: Order[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const { locale, direction } = useLocale();
  const t = useT();
  const colors = useColors();

  if (orders.length === 0) {
    return (
      <div
        style={{
          border: `1px solid ${colors.border}`,
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "13px",
            color: colors.mutedForeground,
            marginBottom: "16px",
          }}
        >
          {t("orders.empty")}
        </p>
        <Link
          href="/shop"
          style={{
            fontFamily: typography.monoFont,
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: colors.accent,
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          {t("orders.browseCatalogue")}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${colors.border}` }}>
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "0",
          fontFamily: typography.monoFont,
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: colors.mutedForeground,
          textTransform: "uppercase",
          padding: "10px 16px",
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <span>{t("orders.orderNumber")}</span>
        <span>{t("orders.date")}</span>
        <span>{t("orders.status")}</span>
        <span style={{ ...textAlignEnd(direction) }}>{t("orders.total")}</span>
      </div>

      {/* Table rows */}
      {orders.map((order) => {
        const statusColor = STATUS_COLORS[order.status] || colors.mutedForeground;
        const date = new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "0",
              padding: "14px 16px",
              borderBottom: `1px solid ${colors.border}`,
              textDecoration: "none",
              transition: "background 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255, 255, 255, 0.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.accent,
                fontWeight: 600,
              }}
            >
              {order.order_number}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: colors.mutedForeground,
              }}
            >
              {date}
            </span>
            <span>
              <span
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  color: statusColor,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  border: `1px solid ${statusColor}`,
                  background: `${statusColor}10`,
                }}
              >
                {t(`orderDetail.status.${order.status}`) || order.status.replace(/_/g, " ")}
              </span>
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
                fontWeight: 600,
                ...textAlignEnd(direction),
              }}
            >
              {formatAED(order.total, locale)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
