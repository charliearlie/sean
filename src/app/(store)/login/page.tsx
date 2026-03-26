"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cipherTokens } from "@/concepts/cipher/tokens";
import AuthForm from "@/concepts/cipher/components/AuthForm";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
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
          Authentication
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
          LOGIN
        </h1>
      </div>

      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />

      <div style={{ maxWidth: "480px", marginTop: "40px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
