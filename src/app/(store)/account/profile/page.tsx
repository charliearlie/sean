"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cipherTokens } from "@/concepts/cipher/tokens";
import AccountNav from "@/concepts/cipher/components/AccountNav";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

  useEffect(() => {
    const loadProfile = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/account/profile");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setPhone(profile.phone || "");
      } else {
        setFullName(user.user_metadata?.full_name || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "136px 24px 80px",
        }}
      >
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "12px",
            color: colors.mutedForeground,
            textAlign: "center",
            padding: "60px 0",
          }}
        >
          Loading profile...
        </p>
      </div>
    );
  }

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
        .cipher-profile-input:focus {
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
          PROFILE
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
          <form onSubmit={handleSubmit}>
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div style={sectionHeaderStyle}>01 // Personal Information</div>
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={{
                      ...inputStyle,
                      opacity: 0.45,
                      cursor: "not-allowed",
                    }}
                    type="email"
                    value={email}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    className="cipher-profile-input"
                    style={inputStyle}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="DR_LAST_FIRST"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    className="cipher-profile-input"
                    style={inputStyle}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971_XX_XXX_XXXX"
                    autoComplete="tel"
                  />
                </div>

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

                {success && (
                  <div
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "11px",
                      color: colors.accent,
                      padding: "10px 12px",
                      border: `1px solid ${colors.accent}`,
                      background: "rgba(0, 255, 178, 0.06)",
                    }}
                  >
                    Profile updated successfully.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: "100%",
                    fontFamily: typography.monoFont,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    padding: "14px 24px",
                    background: saving ? colors.border : colors.accent,
                    color: saving
                      ? colors.mutedForeground
                      : colors.accentForeground,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    transition: "all 0.2s ease-in-out",
                    borderRadius: "0px",
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        colors.accent;
                      (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px ${colors.accent}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      (e.currentTarget as HTMLElement).style.background =
                        colors.accent;
                      (e.currentTarget as HTMLElement).style.color =
                        colors.accentForeground;
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 0 0" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
