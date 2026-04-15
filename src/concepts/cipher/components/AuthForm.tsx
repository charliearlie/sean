"use client";

import { useState } from "react";
import Link from "next/link";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { useT } from "@/shared/i18n/context";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: {
    email: string;
    password: string;
    fullName?: string;
    confirmPassword?: string;
  }) => void;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ mode, onSubmit, loading, error }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, fullName, confirmPassword });
  };

  return (
    <>
      <style jsx global>{`
        .cipher-auth-input:focus {
          border-color: ${colors.accent} !important;
        }
      `}</style>

      <div style={{ border: `1px solid ${colors.border}` }}>
        <div style={sectionHeaderStyle}>
          {mode === "login" ? t("auth.credentials") : t("auth.accountDetails")}
        </div>
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {mode === "register" && (
            <div>
              <label style={labelStyle}>{t("auth.fullName")}</label>
              <input
                className="cipher-auth-input"
                style={inputStyle}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="DR_LAST_FIRST"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>{t("auth.email")}</label>
            <input
              className="cipher-auth-input"
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@domain.ae"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label style={labelStyle}>{t("auth.password")}</label>
            <input
              className="cipher-auth-input"
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={labelStyle}>{t("auth.confirmPassword")}</label>
              <input
                className="cipher-auth-input"
                style={inputStyle}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          )}

          {error && (
            <div
              style={{
                fontFamily: typography.monoFont,
                fontSize: "11px",
                color: "#ef4444",
                padding: "10px 12px",
                border: "1px solid #ef4444",
                background: "rgba(239, 68, 68, 0.08)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              fontFamily: typography.monoFont,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              padding: "14px 24px",
              background: loading ? colors.border : colors.accent,
              color: loading ? colors.mutedForeground : colors.accentForeground,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              transition: "all 0.2s ease-in-out",
              borderRadius: "0px",
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
            {loading
              ? t("auth.processing")
              : mode === "login"
              ? t("auth.accessSystem")
              : t("auth.createAccount")}
          </button>

          <div style={{ textAlign: "center", marginTop: "4px" }}>
            {mode === "login" ? (
              <Link
                href="/register"

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
                  (e.currentTarget as HTMLElement).style.color = colors.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                }}
              >
                {t("auth.noAccount")}
              </Link>
            ) : (
              <Link
                href="/login"

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
                  (e.currentTarget as HTMLElement).style.color = colors.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                }}
              >
                {t("auth.hasAccount")}
              </Link>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
