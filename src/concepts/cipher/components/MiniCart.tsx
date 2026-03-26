"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { useCart } from "@/shared/context/CartContext";
import { useColors } from "@/shared/context/ThemeContext";
import { formatAED } from "@/shared/utils/currency";

const { typography } = cipherTokens;

export default function MiniCart() {
  const { miniCartOpen, lastAddedItem, closeMiniCart, state, totalItems, totalPrice } = useCart();
  const colors = useColors();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // "Just added" mode: auto-close after 4s (paused on hover)
  useEffect(() => {
    if (!miniCartOpen || !lastAddedItem || hovered) return;
    const timer = setTimeout(() => closeMiniCart(), 4000);
    return () => clearTimeout(timer);
  }, [miniCartOpen, lastAddedItem, hovered, closeMiniCart]);

  // Click outside to close (both modes)
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

  const isJustAdded = miniCartOpen && lastAddedItem !== null;
  const isViewingCart = miniCartOpen && lastAddedItem === null;

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
        {miniCartOpen && (
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
            {isJustAdded && lastAddedItem && (
              <>
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
                  Added to cart
                </div>

                {/* Added item */}
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
              </>
            )}

            {isViewingCart && (
              <>
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Your Cart</span>
                  <span style={{ color: colors.mutedForeground }}>
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Cart items list */}
                {state.items.length === 0 ? (
                  <div
                    style={{
                      padding: "24px 16px",
                      fontFamily: typography.monoFont,
                      fontSize: "11px",
                      color: colors.mutedForeground,
                      letterSpacing: "0.1em",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    Your cart is empty
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: "240px",
                      overflowY: "auto",
                    }}
                  >
                    {state.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        style={{
                          padding: "12px 16px",
                          borderBottom: `1px solid ${colors.border}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: typography.monoFont,
                              fontSize: "11px",
                              fontWeight: 600,
                              color: colors.foreground,
                              marginBottom: "2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.product.name}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: typography.monoFont,
                                fontSize: "9px",
                                color: colors.mutedForeground,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                              }}
                            >
                              {item.variant.dosage}
                            </span>
                            <span
                              style={{
                                fontFamily: typography.monoFont,
                                fontSize: "9px",
                                color: colors.mutedForeground,
                                letterSpacing: "0.08em",
                              }}
                            >
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: typography.monoFont,
                            fontSize: "11px",
                            fontWeight: 600,
                            color: colors.accent,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatAED(item.variant.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotal */}
                {state.items.length > 0 && (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderTop: `1px solid ${colors.border}`,
                      fontFamily: typography.monoFont,
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: colors.mutedForeground,
                        textTransform: "uppercase",
                      }}
                    >
                      Subtotal
                    </span>
                    <span
                      style={{
                        color: colors.foreground,
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {formatAED(totalPrice)}
                    </span>
                  </div>
                )}

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
                  <Link
                    href="/cart"
                    onClick={closeMiniCart}
                    style={{
                      display: "block",
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
                      textAlign: "center",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    View Cart
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
