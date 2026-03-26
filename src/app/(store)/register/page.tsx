"use client";

import { useState } from "react";
import { cipherTokens } from "@/concepts/cipher/tokens";
import AuthForm from "@/concepts/cipher/components/AuthForm";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const colors = useColors();

  const handleSubmit = async (data: {
    email: string;
    password: string;
    fullName?: string;
    confirmPassword?: string;
  }) => {
    setLoading(true);
    setError(null);

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
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
          New Account
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
          REGISTER
        </h1>
      </div>

      {success ? (
        <div
          style={{
            border: `1px solid ${colors.accent}`,
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: colors.accent,
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Registration Successful
          </p>
          <p
            style={{
              fontFamily: typography.bodyFont,
              fontSize: "13px",
              color: colors.foreground,
              lineHeight: "1.6",
              marginBottom: "8px",
            }}
          >
            Please check your email to confirm your account.
          </p>
          <p
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            You can close this page after confirming.
          </p>
        </div>
      ) : (
        <AuthForm
          mode="register"
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}

      <div style={{ maxWidth: "480px", marginTop: "40px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
