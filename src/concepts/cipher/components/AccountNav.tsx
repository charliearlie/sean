"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { useLocale, useT } from "@/shared/i18n/context";
import { borderInlineStart, textAlignStart } from "@/shared/i18n/rtl-helpers";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { direction } = useLocale();
  const t = useT();
  const colors = useColors();

  const navItems = [
    { label: t("account.dashboard"), href: "/account" },
    { label: t("account.orders"), href: "/account/orders" },
    { label: t("account.profile"), href: "/account/profile" },
  ];

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      style={{
        border: `1px solid ${colors.border}`,
        position: "sticky",
        top: "72px",
      }}
    >
      <div
        style={{
          fontFamily: typography.monoFont,
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: colors.mutedForeground,
          textTransform: "uppercase",
          padding: "10px 16px",
          background: colors.muted,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {t("account.navigation")}
      </div>
      {navItems.map((item) => {
        const isActive =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "block",
              fontFamily: typography.monoFont,
              fontSize: "11px",
              fontWeight: isActive ? 600 : 400,
              letterSpacing: "0.12em",
              color: isActive ? colors.accent : colors.mutedForeground,
              textDecoration: "none",
              textTransform: "uppercase",
              padding: "12px 16px",
              borderBottom: `1px solid ${colors.border}`,
              ...borderInlineStart(direction, isActive
                ? `2px solid ${colors.accent}`
                : "2px solid transparent"),
              background: isActive ? "rgba(0, 255, 178, 0.04)" : "transparent",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.foreground;
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255, 255, 255, 0.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        style={{
          display: "block",
          width: "100%",
          fontFamily: typography.monoFont,
          fontSize: "11px",
          fontWeight: 400,
          letterSpacing: "0.12em",
          color: "#ef4444",
          textDecoration: "none",
          textTransform: "uppercase",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          borderRadius: "0px",
          cursor: "pointer",
          ...textAlignStart(direction),
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(239, 68, 68, 0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {t("account.logout")}
      </button>
    </nav>
  );
}
