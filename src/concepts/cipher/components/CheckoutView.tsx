"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/shared/context/CartContext";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import { useLocale, useT } from "@/shared/i18n/context";
import { useColors } from "@/shared/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const { typography } = cipherTokens;

const EMIRATES_KEYS = ["abuDhabi", "dubai", "sharjah", "ajman", "ummAlQuwain", "rasAlKhaimah", "fujairah"];
const EMIRATES_VALUES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emirate: string;
  postalCode: string;
}

interface CheckoutViewProps {
  onSubmit: (formData: CheckoutFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  user: User | null;
  profile?: { full_name?: string; email?: string } | null;
}

export default function CheckoutView({ onSubmit, loading, error, user, profile }: CheckoutViewProps) {
  const { state, totalPrice } = useCart();
  const { locale } = useLocale();
  const t = useT();
  const colors = useColors();

  const labelStyle: React.CSSProperties = {
    fontFamily: typography.monoFont,
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: colors.mutedForeground,
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: typography.monoFont,
    fontSize: "12px",
    color: colors.foreground,
    background: colors.muted,
    border: `1px solid ${colors.border}`,
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    borderRadius: "0px",
    transition: "border-color 0.2s ease-in-out",
  };

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
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [freeShipping, setFreeShipping] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  const items = state.items;
  const grandTotal = totalPrice + (shippingCost ?? 0);

  const [form, setForm] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Dubai",
    emirate: "Dubai",
    postalCode: "",
  });

  useEffect(() => {
    const fetchShipping = async () => {
      setShippingLoading(true);
      try {
        const res = await fetch(`/api/shipping/rate?emirate=${encodeURIComponent(form.emirate)}&subtotal=${totalPrice}`);
        const data = await res.json();
        setShippingCost(data.shippingCost);
        setFreeShipping(data.freeShippingApplied);
      } catch {
        setShippingCost(25); // fallback
      } finally {
        setShippingLoading(false);
      }
    };
    fetchShipping();
  }, [form.emirate, totalPrice]);

  // Auth state for inline login/register during checkout
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authExpanded, setAuthExpanded] = useState(false);

  // Auto-populate form from profile when user logs in
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || profile.full_name || "",
        email: prev.email || profile.email || "",
      }));
    }
  }, [profile]);

  const handleAuthSubmit = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      const supabase = createClient();
      if (authMode === "register") {
        if (authPassword !== authConfirmPassword) {
          setAuthError("Passwords do not match.");
          setAuthLoading(false);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } },
        });
        if (signUpError) {
          setAuthError(signUpError.message);
        } else {
          // Auto-fill form with registration data so user can proceed immediately
          setForm((prev) => ({
            ...prev,
            name: prev.name || authName,
            email: prev.email || authEmail,
          }));
          if (data.session === null) {
            setAuthSuccess("Account created! We've pre-filled your details below. You can confirm your email later.");
            setAuthExpanded(false);
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (signInError) {
          setAuthError(signInError.message);
        }
        // On success, onAuthStateChange in checkout page will update user + profile
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      <style jsx global>{`
        @media (max-width: 900px) {
          .cipher-checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
        .cipher-input:focus {
          border-color: ${colors.accent} !important;
        }
        .cipher-select:focus {
          border-color: ${colors.accent} !important;
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
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: colors.mutedForeground,
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {t("checkout.orderProcessing")}
        </p>
        <h1
          style={{
            fontFamily: typography.monoFont,
            fontSize: "22px",
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: "0.05em",
          }}
        >
          {t("checkout.title")}
        </h1>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            fontFamily: typography.monoFont,
            fontSize: "11px",
            color: "#FF4444",
            letterSpacing: "0.05em",
            padding: "12px 16px",
            border: "1px solid #FF4444",
            background: "rgba(255, 68, 68, 0.05)",
            marginBottom: "24px",
          }}
        >
          {`// ERROR: ${error}`}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="cipher-checkout-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Left: form sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Auth section */}
            <div style={{ border: `1px solid ${colors.border}` }}>
              {user ? (
                /* Logged-in state: compact bar */
                <div style={{
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: colors.accent, display: "inline-block",
                    }} />
                    <span style={{
                      fontFamily: typography.monoFont, fontSize: "10px",
                      color: colors.foreground, letterSpacing: "0.08em",
                    }}>
                      {user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    }}
                    style={{
                      fontFamily: typography.monoFont, fontSize: "9px",
                      letterSpacing: "0.1em", color: colors.mutedForeground,
                      background: "none", border: "none", cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                /* Not logged in: collapsible auth form */
                <>
                  <button
                    type="button"
                    onClick={() => setAuthExpanded(!authExpanded)}
                    style={{
                      ...sectionHeaderStyle,
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      border: "none",
                      borderBottom: authExpanded ? `1px solid ${colors.border}` : "none",
                    }}
                  >
                    <span>Have an account? Log in or register</span>
                    <span style={{ fontSize: "11px", color: colors.mutedForeground }}>
                      {authExpanded ? "−" : "+"}
                    </span>
                  </button>
                  {authSuccess && !authExpanded && (
                    <div style={{ padding: "10px 16px" }}>
                      <p style={{ fontFamily: typography.monoFont, fontSize: "10px", color: colors.accent, letterSpacing: "0.05em", margin: 0 }}>
                        {authSuccess}
                      </p>
                    </div>
                  )}
                  {authExpanded && (
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {authError && (
                        <p style={{ fontFamily: typography.monoFont, fontSize: "10px", color: "#FF4444", letterSpacing: "0.05em", margin: 0 }}>
                          {authError}
                        </p>
                      )}
                      {authSuccess && (
                        <p style={{ fontFamily: typography.monoFont, fontSize: "10px", color: colors.accent, letterSpacing: "0.05em", margin: 0 }}>
                          {authSuccess}
                        </p>
                      )}
                      {authMode === "register" && (
                        <div>
                          <label style={labelStyle}>Full Name</label>
                          <input className="cipher-input" style={inputStyle} value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your Name" autoComplete="name" />
                        </div>
                      )}
                      <div>
                        <label style={labelStyle}>Email</label>
                        <input className="cipher-input" style={inputStyle} type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="user@domain.ae" autoComplete="email" />
                      </div>
                      <div>
                        <label style={labelStyle}>Password</label>
                        <input className="cipher-input" style={inputStyle} type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" autoComplete={authMode === "login" ? "current-password" : "new-password"} />
                      </div>
                      {authMode === "register" && (
                        <div>
                          <label style={labelStyle}>Confirm Password</label>
                          <input className="cipher-input" style={inputStyle} type="password" value={authConfirmPassword} onChange={(e) => setAuthConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={handleAuthSubmit}
                          disabled={authLoading}
                          style={{
                            fontFamily: typography.monoFont, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", padding: "10px 20px",
                            background: colors.accent, color: colors.accentForeground, border: "none", cursor: authLoading ? "not-allowed" : "pointer",
                            textTransform: "uppercase", opacity: authLoading ? 0.7 : 1,
                          }}
                        >
                          {authLoading ? "..." : authMode === "login" ? "Log In" : "Register"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); setAuthSuccess(null); }}
                          style={{
                            fontFamily: typography.monoFont, fontSize: "9px", letterSpacing: "0.1em", color: colors.mutedForeground,
                            background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textTransform: "uppercase",
                          }}
                        >
                          {authMode === "login" ? "Create Account" : "Log In Instead"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Contact section */}
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>{t("checkout.contact")}</div>
              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>{t("checkout.fullName")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="DR_LAST_FIRST"
                    required
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t("checkout.email")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@domain.ae"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>{t("checkout.phone")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+971_XX_XXX_XXXX"
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Shipping section */}
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>{t("checkout.shippingSection")}</div>
              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>{t("checkout.address")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Dubai Science Park, Bldg A"
                    required
                    autoComplete="street-address"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t("checkout.city")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Dubai"
                    required
                    autoComplete="address-level2"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t("checkout.emirate")}</label>
                  <select
                    className="cipher-select"
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    name="emirate"
                    value={form.emirate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    {EMIRATES_KEYS.map((key, i) => (
                      <option
                        key={key}
                        value={EMIRATES_VALUES[i]}
                        style={{ background: colors.muted, color: colors.foreground }}
                      >
                        {t(`checkout.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t("checkout.postalCode")}</label>
                  <input
                    className="cipher-input"
                    style={inputStyle}
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="00000"
                    autoComplete="postal-code"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Payment info notice */}
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>{t("checkout.paymentSection")}</div>
              <div style={{ padding: "20px" }}>
                <p
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "10px",
                    color: colors.mutedForeground,
                    letterSpacing: "0.1em",
                    padding: "10px 14px",
                    border: `1px solid ${colors.border}`,
                    background: colors.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {t("checkout.paymentNote")}
                </p>
              </div>
            </div>
          </div>

          {/* Right: order summary sidebar */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.card,
              position: "sticky",
              top: "72px",
            }}
          >
            <div style={sectionHeaderStyle}>{t("checkout.orderSummary")}</div>

            {/* Items list */}
            <div style={{ borderBottom: `1px solid ${colors.border}` }}>
              {items.map((item) => (
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
                        fontSize: "9px",
                        color: colors.accent,
                        letterSpacing: "0.12em",
                        marginBottom: "2px",
                      }}
                    >
                      {item.product.compoundCode}
                    </p>
                    <p
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: "11px",
                        color: colors.foreground,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.product.name}
                    </p>
                    <p
                      style={{
                        fontFamily: typography.monoFont,
                        fontSize: "9px",
                        color: colors.mutedForeground,
                        marginTop: "2px",
                      }}
                    >
                      {item.variant.dosage} x {item.quantity}
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "12px",
                      color: colors.foreground,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatAED(item.variant.price * item.quantity, locale)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
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
                  {t("checkout.subtotal")}
                </span>
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "12px",
                    color: colors.foreground,
                  }}
                >
                  {formatAED(totalPrice, locale)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  paddingBottom: "16px",
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
                  {t("checkout.shipping")}
                </span>
                <span style={{ fontFamily: typography.monoFont, fontSize: "12px", color: freeShipping ? colors.accent : colors.foreground, fontWeight: freeShipping ? 700 : 400 }}>
                  {shippingLoading ? "..." : freeShipping ? "FREE" : formatAED(shippingCost ?? 0, locale)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
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
                  {t("checkout.total")}
                </span>
                <span
                  style={{
                    fontFamily: typography.monoFont,
                    fontSize: "16px",
                    color: colors.accent,
                    fontWeight: 700,
                  }}
                >
                  {formatAED(grandTotal, locale)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                style={{
                  width: "100%",
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  padding: "14px 24px",
                  background: loading ? colors.muted : colors.accent,
                  color: loading ? colors.mutedForeground : colors.accentForeground,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  transition: "all 0.2s ease-in-out",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = colors.accent;
                    (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.accent}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.background = colors.accent;
                    (e.currentTarget as HTMLElement).style.color = colors.accentForeground;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }
                }}
              >
                {loading ? t("checkout.processing") : t("checkout.submit")}
              </button>

              <Link
                href="/cart"
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
                {t("checkout.backArrow")} {t("checkout.backToCart")}
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
