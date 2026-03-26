"use client";

import { useState } from "react";
import { useT } from "@/shared/i18n/context";

export default function AgeVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const t = useT();

  if (dismissed) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 56,
        zIndex: 99,
        background: "var(--accent, #00FFB2)",
        color: "var(--accent-foreground, #000)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      <span>{t("age.banner")}</span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "var(--accent-foreground, #000)",
          color: "var(--accent, #00FFB2)",
          border: "none",
          padding: "6px 16px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          marginInlineStart: "16px",
        }}
      >
        {t("age.confirm")}
      </button>
    </div>
  );
}
