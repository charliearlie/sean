"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function TermsPage() {
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
        Legal
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
        Terms of Service
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Research Use Only</p>
        <p style={bodyText}>
          All products sold by Pure Peptides are intended strictly for in-vitro research and
          laboratory use only. By placing an order, you confirm that you are a qualified researcher
          or are purchasing on behalf of a research institution. Products are not intended for human
          or veterinary use, food additives, or household chemicals.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Jurisdiction</p>
        <p style={bodyText}>
          These terms are governed by and construed in accordance with the laws of the United Arab
          Emirates. Any disputes arising from or in connection with these terms shall be subject to
          the exclusive jurisdiction of the courts of the UAE.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Orders &amp; Payment</p>
        <p style={bodyText}>
          All orders are subject to availability and confirmation of the order price. We reserve the
          right to refuse any order. Prices are listed in AED and are subject to change without
          notice. Payment must be completed at the time of order through our accepted payment
          methods. Orders are processed within 1–2 business days of payment confirmation.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Refund &amp; Cancellation Policy</p>
        <p style={bodyText}>
          Due to the nature of research materials, all sales are final once shipped. Cancellation
          requests may be accepted if the order has not yet been dispatched. If you receive a damaged
          or incorrect product, please contact us within 48 hours of delivery. We will arrange a
          replacement or issue a refund at our discretion. Refunds are processed to the original
          payment method within 7–14 business days.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Liability</p>
        <p style={bodyText}>
          Pure Peptides shall not be held liable for any damages resulting from misuse of products.
          The buyer assumes all responsibility for the handling, storage, and application of
          purchased materials. We make no warranties, express or implied, regarding the suitability
          of products for any particular research application.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
