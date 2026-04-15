"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/shared/context/CartContext";
import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");
  const { clearCart } = useCart();
  const colors = useColors();

  const [status, setStatus] = useState<"loading" | "paid" | "failed" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setErrorMsg("No order ID provided.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    const POLL_INTERVAL = 3000;

    async function verify() {
      try {
        const res = await fetch(`/api/payment/verify?order=${orderId}&token=${token}`);
        const data = await res.json();

        if (cancelled) return;

        if (data.status === "paid") {
          setStatus("paid");
          setOrderNumber(data.orderNumber);
          clearCart();
        } else if (data.status === "failed") {
          setStatus("failed");
          setOrderNumber(data.orderNumber);
        } else if (data.status === "pending") {
          attempts++;
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(verify, POLL_INTERVAL);
          } else {
            setStatus("error");
            setErrorMsg("Payment is still processing. Please check your order status in a few minutes.");
          }
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Could not verify payment.");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Failed to verify payment status.");
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [orderId, clearCart]);

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      {status === "loading" && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: colors.mutedForeground,
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Verifying Payment
          </p>
          <div
            style={{
              fontFamily: typography.monoFont,
              fontSize: "14px",
              color: colors.foreground,
              padding: "40px",
              border: `1px solid ${colors.border}`,
              background: colors.card,
            }}
          >
            <p style={{ marginBottom: "12px" }}>Processing verification...</p>
            <p
              style={{
                fontSize: "10px",
                color: colors.mutedForeground,
                letterSpacing: "0.1em",
              }}
            >
{`// VERIFYING_PAYMENT`}
            </p>
          </div>
        </div>
      )}

      {status === "paid" && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: colors.accent,
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Payment Confirmed
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
            ORDER CONFIRMED
          </h1>

          <div
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.card,
              padding: "32px 24px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.15em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Order Number
            </p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "18px",
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: "0.08em",
                marginBottom: "24px",
              }}
            >
              {orderNumber}
            </p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: colors.cardForeground,
                lineHeight: 1.7,
              }}
            >
              Your payment has been processed successfully. You will receive an
              order confirmation at your email address. We will notify you when
              your order ships.
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
              href="/shop"
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
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
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
              View Orders
            </Link>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: "#FF4444",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Payment Failed
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
              }}
            >
              Your payment could not be processed. No charges have been applied.
              Please try again or contact support for assistance.
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
            <a
              href="https://wa.me/971501234567"
              target="_blank"
              rel="noopener noreferrer"
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
              WhatsApp Support
            </a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: "#FF4444",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Error
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
            VERIFICATION FAILED
          </h1>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.card,
              padding: "32px 24px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: colors.cardForeground,
                lineHeight: 1.7,
              }}
            >
              {errorMsg}
            </p>
          </div>
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
            }}
          >
            Return to Cart
          </Link>
        </div>
      )}

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
