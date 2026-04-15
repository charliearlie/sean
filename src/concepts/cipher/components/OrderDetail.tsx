"use client";

import Link from "next/link";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import { useLocale, useT } from "@/shared/i18n/context";
import { textAlignEnd, textAlignStart } from "@/shared/i18n/rtl-helpers";
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

const STATUS_SEQUENCE = [
  "pending",
  "payment_processing",
  "paid",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

interface OrderItem {
  id: string;
  product_name: string;
  variant_label: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_emirate: string;
  shipping_postal_code?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number?: string;
  tracking_url?: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  order_items: OrderItem[];
}

interface OrderDetailProps {
  order: Order;
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const { locale, direction } = useLocale();
  const t = useT();
  const colors = useColors();

  const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: typography.monoFont,
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: colors.mutedForeground,
    textTransform: "uppercase",
    padding: "10px 16px",
    background: colors.muted,
    borderBottom: `1px solid ${colors.border}`,
  };

  const statusColor = STATUS_COLORS[order.status] || colors.mutedForeground;
  const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back link */}
      <Link
        href="/account/orders"
        style={{
          fontFamily: typography.monoFont,
          fontSize: "10px",
          letterSpacing: "0.12em",
          color: colors.mutedForeground,
          textDecoration: "none",
          textTransform: "uppercase",
          transition: "color 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = colors.foreground;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
        }}
      >
        {t("orderDetail.backArrow")} {t("orderDetail.backToOrders")}
      </Link>

      {/* Order header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
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
            {t("orderDetail.order")} {order.order_number}
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            {t("orderDetail.placed")} {formatDate(order.created_at)}
          </p>
        </div>
        <span
          style={{
            fontFamily: typography.monoFont,
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: statusColor,
            textTransform: "uppercase",
            padding: "4px 12px",
            border: `1px solid ${statusColor}`,
            background: `${statusColor}10`,
            fontWeight: 600,
          }}
        >
          {t(`orderDetail.status.${order.status}`)}
        </span>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>{t("orderDetail.statusTimeline")}</div>
          <div style={{ padding: "20px 16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {/* Progress line */}
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  right: "6px",
                  height: "2px",
                  background: colors.border,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  width:
                    currentIndex >= 0
                      ? `${(currentIndex / (STATUS_SEQUENCE.length - 1)) * 100}%`
                      : "0%",
                  height: "2px",
                  background: colors.accent,
                  transition: "width 0.3s ease-in-out",
                }}
              />
              {STATUS_SEQUENCE.map((status, i) => {
                const isPast = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div
                    key={status}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "0px",
                        background: isPast ? colors.accent : colors.muted,
                        border: `1px solid ${isPast ? colors.accent : colors.border}`,
                        marginBottom: "8px",
                        boxShadow: isCurrent
                          ? `0 0 8px ${colors.accent}40`
                          : "none",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: "7px",
                        letterSpacing: "0.1em",
                        color: isPast ? colors.foreground : colors.mutedForeground,
                        textTransform: "uppercase",
                        textAlign: "center",
                        maxWidth: "60px",
                        lineHeight: "1.3",
                      }}
                    >
                      {t(`orderDetail.status.${status}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.tracking_number && (
        <div style={{ border: `1px solid ${colors.border}` }}>
          <div style={sectionHeaderStyle}>{t("orderDetail.trackingInfo")}</div>
          <div style={{ padding: "16px" }}>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
                marginBottom: "8px",
              }}
            >
              {t("orderDetail.trackingNumber")}{" "}
              {order.tracking_url ? (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: colors.accent,
                    textDecoration: "none",
                  }}
                >
                  {order.tracking_number}
                </a>
              ) : (
                <span style={{ color: colors.accent }}>{order.tracking_number}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Order items */}
      <div style={{ border: `1px solid ${colors.border}` }}>
        <div style={sectionHeaderStyle}>{t("orderDetail.orderItems")}</div>
        {/* Items header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 80px 100px",
            gap: "0",
            padding: "10px 16px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {[t("orderDetail.product"), t("orderDetail.sku"), t("orderDetail.qty"), t("orderDetail.total")].map((h, i) => (
            <span
              key={h}
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.15em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                ...(i === 3 ? textAlignEnd(direction) : textAlignStart(direction)),
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {order.order_items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 80px 100px",
              gap: "0",
              padding: "12px 16px",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  color: colors.foreground,
                  fontWeight: 600,
                }}
              >
                {item.product_name}
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  color: colors.mutedForeground,
                  marginTop: "2px",
                }}
              >
                {item.variant_label}
              </p>
            </div>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "10px",
                color: colors.mutedForeground,
                alignSelf: "center",
              }}
            >
              {item.sku}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
                alignSelf: "center",
              }}
            >
              {item.quantity}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
                fontWeight: 600,
                ...textAlignEnd(direction),
                alignSelf: "center",
              }}
            >
              {formatAED(item.total_price, locale)}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div style={{ padding: "16px" }}>
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
              {t("orderDetail.subtotal")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
              }}
            >
              {formatAED(order.subtotal, locale)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${colors.border}`,
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
              {t("orderDetail.shipping")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                color: colors.foreground,
              }}
            >
              {formatAED(order.shipping_cost, locale)}
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
                fontSize: "12px",
                color: colors.foreground,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {t("orderDetail.grandTotal")}
            </span>
            <span
              style={{
                fontFamily: typography.monoFont,
                fontSize: "16px",
                color: colors.accent,
                fontWeight: 700,
              }}
            >
              {formatAED(order.total, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div style={{ border: `1px solid ${colors.border}` }}>
        <div style={sectionHeaderStyle}>{t("orderDetail.shippingDetails")}</div>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "12px",
              color: colors.foreground,
              fontWeight: 600,
            }}
          >
            {order.contact_name}
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            {order.shipping_address}
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            {order.shipping_city}, {order.shipping_emirate}
            {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            {order.contact_email}
          </p>
          {order.contact_phone && (
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: colors.mutedForeground,
              }}
            >
              {order.contact_phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
