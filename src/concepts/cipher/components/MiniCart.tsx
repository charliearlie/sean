"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { useCart } from "@/shared/context/CartContext";
import { useColors } from "@/shared/context/ThemeContext";
import { formatAED } from "@/shared/utils/currency";

const { typography } = cipherTokens;

export default function MiniCart() {
  const { miniCartOpen, lastAddedItem, closeMiniCart, totalItems, totalPrice, state } = useCart();
  const colors = useColors();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Auto-close after 4s when showing "just added" popup (paused on hover)
  useEffect(() => {
    if (!miniCartOpen || !lastAddedItem || hovered) return;
    const timer = setTimeout(() => closeMiniCart(), 4000);
    return () => clearTimeout(timer);
  }, [miniCartOpen, lastAddedItem, hovered, closeMiniCart]);

  // Click outside to close
  useEffect(() => {
    if (!miniCartOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMiniCart();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [miniCartOpen, closeMiniCart]);

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          .cipher-mini-cart {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            width: auto !important;
            top: 56px !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
      <AnimatePresence>
        {miniCartOpen && (lastAddedItem || state.items.length > 0) && (
          <motion.div
            ref={ref}
            className="cipher-mini-cart"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              width: "320px",
              background: colors.card,
              border: `1px solid ${colors.border}`,
              zIndex: 200,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "10px 16px",
                background: colors.muted,
                borderBottom: `1px solid ${colors.border}`,
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: colors.accent,
                textTransform: "uppercase",
              }}
            >
              {lastAddedItem ? "Added to cart" : "Your cart"}
            </div>

            {/* Items */}
            {lastAddedItem ? (
              <div style={{ padding: "16px" }}>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: colors.foreground,
                    marginBottom: "4px",
                  }}
                >
                  {lastAddedItem.product.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                    {lastAddedItem.variant.dosage}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "12px",
                      fontWeight: 600,
                      color: colors.accent,
                    }}
                  >
                    {formatAED(lastAddedItem.variant.price)}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "8px 16px", maxHeight: "200px", overflowY: "auto" }}>
                {state.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    style={{
                      padding: "8px 0",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.foreground,
                        marginBottom: "4px",
                      }}
                    >
                      {item.product.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                        {item.variant.dosage} × {item.quantity}
                      </span>
                      <span
                        style={{
                          fontFamily: typography.monoFont,
                          fontSize: "12px",
                          fontWeight: 600,
                          color: colors.accent,
                        }}
                      >
                        {formatAED(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart summary */}
            <div
              style={{
                padding: "10px 16px",
                borderTop: `1px solid ${colors.border}`,
                fontFamily: typography.monoFont,
                fontSize: "10px",
                color: colors.mutedForeground,
                letterSpacing: "0.1em",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
              <span style={{ color: colors.foreground, fontWeight: 600 }}>{formatAED(totalPrice)}</span>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <button
                onClick={() => {
                  closeMiniCart();
                  router.push("/cart");
                }}
                style={{
                  width: "100%",
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  padding: "10px",
                  background: colors.accent,
                  color: colors.accentForeground,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                View Cart
              </button>
              <button
                onClick={closeMiniCart}
                style={{
                  width: "100%",
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  padding: "8px",
                  background: "transparent",
                  color: colors.mutedForeground,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
