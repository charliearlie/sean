"use client";

import { useColors } from "@/shared/context/ThemeContext";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const colors = useColors();

  return (
    <div
      style={{
        ["--background" as string]: colors.background,
        ["--foreground" as string]: colors.foreground,
        ["--accent" as string]: colors.accent,
        ["--accent-foreground" as string]: colors.accentForeground,
        ["--muted" as string]: colors.muted,
        ["--muted-foreground" as string]: colors.mutedForeground,
        ["--border" as string]: colors.border,
        ["--card" as string]: colors.card,
        ["--card-foreground" as string]: colors.cardForeground,
        background: colors.background,
        color: colors.foreground,
        minHeight: "100vh",
        overflowX: "hidden",
        transition: "background 0.3s ease-in-out, color 0.3s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}
