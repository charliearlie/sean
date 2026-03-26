"use client";

import { useT } from "@/shared/i18n/context";

export default function ResearchDisclaimer() {
  const t = useT();
  return (
    <div
      style={{
        borderTop: "1px solid var(--border, #333)",
        padding: "16px 0",
        marginTop: "24px",
        fontSize: "12px",
        lineHeight: "1.6",
        color: "var(--muted-foreground, #888)",
        maxWidth: "800px",
      }}
    >
      <p>
        <strong style={{ color: "var(--foreground, #fff)" }}>
          {t("disclaimer.title")}
        </strong>{" "}
        {t("disclaimer.text")}
      </p>
    </div>
  );
}
