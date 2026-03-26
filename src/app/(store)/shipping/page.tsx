"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function ShippingPage() {
  const colors = useColors();

  const sectionStyle = {
    border: `1px solid ${colors.border}`,
    background: colors.card,
    padding: "32px 24px",
    marginBottom: "24px",
  };

  const sectionHeading = {
    fontFamily: typography.monoFont,
    fontSize: "10px",
    fontWeight: 600 as const,
    letterSpacing: "0.2em",
    color: colors.mutedForeground,
    textTransform: "uppercase" as const,
    marginBottom: "16px",
  };

  const bodyText = {
    fontSize: "13px",
    color: colors.cardForeground,
    lineHeight: 1.7,
    margin: 0,
    marginBottom: "12px",
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "136px 24px 80px" }}>
      <p
        style={{
          fontFamily: typography.monoFont,
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: colors.accent,
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Information
      </p>
      <h1
        style={{
          fontFamily: typography.monoFont,
          fontSize: "22px",
          fontWeight: 700,
          color: colors.foreground,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "32px",
        }}
      >
        Shipping Information
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>UAE Delivery</p>
        <p style={bodyText}>
          We offer delivery across all seven emirates of the United Arab Emirates. Standard delivery
          within Dubai and Abu Dhabi takes 1–2 business days. Delivery to other emirates typically
          takes 2–3 business days. Same-day delivery may be available for orders placed before 12:00
          PM within Dubai.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>International Shipping</p>
        <p style={bodyText}>
          We ship internationally to select countries where research peptide importation is
          permitted. International orders are shipped via express courier and typically arrive within
          5–10 business days depending on the destination. Please note that the buyer is responsible
          for any customs duties, taxes, or import fees that may apply.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Processing Times</p>
        <p style={bodyText}>
          Orders are processed within 1–2 business days after payment confirmation. You will receive
          a confirmation email once your order has been placed, and a shipping notification with
          tracking details once your order has been dispatched. Business days are Sunday through
          Thursday (UAE business week).
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Tracking</p>
        <p style={bodyText}>
          All shipments include tracking. Once your order has been dispatched, you will receive an
          email with your tracking number and a link to track your package. You can also contact us
          via WhatsApp for real-time updates on your delivery status.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Packaging</p>
        <p style={bodyText}>
          All products are shipped in temperature-controlled packaging to maintain compound
          integrity. Items are securely sealed and labeled with proper research material
          identification. Packaging is discreet with no external product descriptions.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
