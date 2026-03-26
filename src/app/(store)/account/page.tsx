import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { cipherTokens } from "@/concepts/cipher/tokens";
import AccountNav from "@/concepts/cipher/components/AccountNav";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import Link from "next/link";

const { typography } = cipherTokens;

const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
};

export default async function AccountDashboard() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email;

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .cipher-account-layout {
            grid-template-columns: 1fr !important;
          }
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
          Account
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
          DASHBOARD
        </h1>
      </div>

      <div
        className="cipher-account-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <AccountNav />

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Welcome */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              padding: "24px",
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
              Welcome Back
            </p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "16px",
                color: colors.accent,
                fontWeight: 700,
              }}
            >
              {displayName}
            </p>
          </div>

          {/* Quick links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "16px",
            }}
          >
            <Link
              href="/account/profile"
              prefetch={false}
              style={{
                border: `1px solid ${colors.border}`,
                padding: "20px",
                textDecoration: "none",
                transition: "border-color 0.2s ease-in-out",
              }}
            >
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: colors.accent,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Profile
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  color: colors.mutedForeground,
                }}
              >
                Edit account details
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 0 0",
        }}
      >
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
