"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentCancelContent />
    </Suspense>
  );
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");
  const colors = useColors();

  const [orderNumber, setOrderNumber] = useState<string>("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(`/api/payment/verify?order=${orderId}&token=${token}`);
        const data = await res.json();
        if (!cancelled) {
          setOrderNumber(data.orderNumber || "");
          setVerified(true);
        }
      } catch {
        if (!cancelled) setVerified(true);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "136px 24px 80px",
        textAlign: "center",
      }}
    >
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
        Payment Cancelled
      </p>
      <h1
        style={{
          fontFamily: typography.monoFont,
          fontSize: "22px",
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: "0.05em",
          marginBottom: "32px",
        }}
      >
        ORDER NOT COMPLETED
      </h1>

      <div
        style={{
          border: `1px solid ${colors.border}`,
          background: colors.card,
          padding: "32px 24px",
          marginBottom: "24px",
        }}
      >
        {!verified && (
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              color: colors.mutedForeground,
              letterSpacing: "0.1em",
              marginBottom: "16px",
            }}
          >
{`// UPDATING_ORDER_STATUS...`}
          </p>
        )}
        {orderNumber && (
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "10px",
              color: colors.mutedForeground,
              letterSpacing: "0.1em",
              marginBottom: "16px",
            }}
          >
            REF: {orderNumber}
          </p>
        )}
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "11px",
            color: colors.cardForeground,
            lineHeight: 1.7,
            marginBottom: "8px",
          }}
        >
          Your payment was cancelled. No charges have been applied to your
          account. Your cart items are still available.
        </p>
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "10px",
            color: colors.mutedForeground,
            letterSpacing: "0.08em",
          }}
        >
          You can return to your cart or try checking out again.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/cart"
          style={{
            fontFamily: typography.monoFont,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "14px 28px",
            background: colors.accent,
            color: colors.accentForeground,
            border: "none",
            textDecoration: "none",
            textTransform: "uppercase",
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
          Return to Cart
        </Link>
        <Link
          href="/checkout"
          style={{
            fontFamily: typography.monoFont,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "14px 28px",
            background: "transparent",
            color: colors.foreground,
            boxShadow: `inset 0 0 0 1px ${colors.border}`,
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.accent}`;
            (e.currentTarget as HTMLElement).style.color = colors.accent;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.border}`;
            (e.currentTarget as HTMLElement).style.color = colors.foreground;
          }}
        >
          Try Again
        </Link>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
