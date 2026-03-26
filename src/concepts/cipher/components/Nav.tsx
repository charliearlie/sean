"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { fadeIn } from "@/lib/motion";
import { useCart } from "@/shared/context/CartContext";
import MiniCart from "@/concepts/cipher/components/MiniCart";
import { useLocale, useT } from "@/shared/i18n/context";
import { textAlignStart } from "@/shared/i18n/rtl-helpers";
import { useTheme, useColors } from "@/shared/context/ThemeContext";
import type { User } from "@supabase/supabase-js";

const { typography } = cipherTokens;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalItems, miniCartOpen, openMiniCart, closeMiniCart } = useCart();
  const router = useRouter();
  const { direction } = useLocale();
  const t = useT();
  const { theme, toggleTheme, mounted } = useTheme();
  const colors = useColors();

  const linkStyle: React.CSSProperties = {
    fontFamily: typography.monoFont,
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.15em",
    color: colors.mutedForeground,
    textDecoration: "none",
    textTransform: "uppercase",
    transition: "color 0.2s ease-in-out",
  };

  const navLinks = [
    { label: t("nav.research"), href: "/" },
    { label: t("nav.catalogue"), href: "/shop" },
    ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();

      const checkAdmin = async (userId: string) => {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();
        setIsAdmin(data?.role === "admin");
      };

      supabase.auth.getUser().then(({ data: { user: u } }) => {
        setUser(u);
        if (u) checkAdmin(u.id);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const navBg = theme === "dark" ? "rgba(10, 13, 18, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const mobileBg = theme === "dark" ? "rgba(10, 13, 18, 0.97)" : "rgba(255, 255, 255, 0.97)";

  return (
    <>
      <style jsx global>{`
        .cipher-nav-toggle {
          display: none;
          background: transparent;
          border: 1px solid ${colors.border};
          color: ${colors.foreground};
          font-size: 20px;
          line-height: 1;
          padding: 4px 8px;
          cursor: pointer;
        }
        .cipher-nav-mobile-dropdown {
          display: none;
        }
        @media (max-width: 768px) {
          .cipher-nav-links {
            display: none !important;
          }
          .cipher-nav-toggle {
            display: block;
          }
          .cipher-nav-mobile-dropdown.open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 56px;
            left: 0;
            right: 0;
            background: ${mobileBg};
            border-bottom: 1px solid ${colors.border};
            padding: 8px 0;
            z-index: 99;
          }
        }
      `}</style>
      <motion.nav
        variants={fadeIn(0.45, "easeInOut")}
        initial="hidden"
        animate="visible"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? navBg : "transparent",
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 0.3s ease-in-out",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            prefetch={false}
            style={{
              fontFamily: typography.monoFont,
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: colors.accent,
              textDecoration: "none",
            }}
          >
            PURE PEPTIDES
          </Link>

          <div className="cipher-nav-links" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                style={linkStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.foreground;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="cipher-nav-links" style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              style={{
                ...linkStyle,
                textTransform: "none",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: "6px",
                fontSize: "22px",
                lineHeight: 1,
                opacity: mounted ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.foreground;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
              }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Auth link */}
            <div className="cipher-nav-links" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {user ? (
                <Link
                  href="/account"
                  prefetch={false}
                  style={{
                    ...linkStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.foreground;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                  }}
                >
                  {t("nav.account")}
                </Link>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  style={{
                    ...linkStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.foreground;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                  }}
                >
                  {t("nav.login")}
                </Link>
              )}
            </div>

            {/* Cart button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => miniCartOpen ? closeMiniCart() : openMiniCart()}
                style={{
                  ...linkStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.foreground;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.mutedForeground;
                }}
                aria-label="Toggle cart"
              >
                {t("nav.cart")} [{totalItems}]
              </button>
              <MiniCart />
            </div>

            <button
              className="cipher-nav-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "\u2715" : "\u2630"}
            </button>
          </div>
        </div>

        <div className={`cipher-nav-mobile-dropdown${mobileOpen ? " open" : ""}`}>
          <button
            onClick={() => {
              toggleTheme();
              setMobileOpen(false);
            }}
            style={{
              fontFamily: typography.monoFont,
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "0.15em",
              color: colors.mutedForeground,
              textDecoration: "none",
              padding: "12px 24px",
              background: "transparent",
              border: "none",
              borderBlockEnd: `1px solid ${colors.border}`,
              ...textAlignStart(direction),
              cursor: "pointer",
              width: "100%",
            }}
          >
            {theme === "dark" ? "\u2600 Light Mode" : "\u263E Dark Mode"}
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.15em",
                color: colors.mutedForeground,
                textDecoration: "none",
                textTransform: "uppercase",
                padding: "12px 24px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/account"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  color: colors.mutedForeground,
                  textDecoration: "none",
                  textTransform: "uppercase",
                  padding: "12px 24px",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {t("nav.accountMobile")}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  color: "#ef4444",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  padding: "12px 24px",
                  background: "transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: `1px solid ${colors.border}`,
                  borderLeft: "none",
                  ...textAlignStart(direction),
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: typography.monoFont,
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.15em",
                color: colors.mutedForeground,
                textDecoration: "none",
                textTransform: "uppercase",
                padding: "12px 24px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {t("nav.loginMobile")}
            </Link>
          )}
        </div>
      </motion.nav>
    </>
  );
}
