"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function ProtocolsPage() {
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
        Research
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
        Research Protocols
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Handling Guidelines</p>
        <p style={bodyText}>
          Research peptides and compounds should be handled with appropriate laboratory safety
          equipment, including gloves and eye protection. Always work in a clean, controlled
          environment to prevent contamination. Use calibrated instruments for measuring and
          reconstitution to ensure accurate dosing in your research applications.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Storage Recommendations</p>
        <p style={bodyText}>
          Lyophilized (freeze-dried) peptides should be stored at -20°C or below for long-term
          storage. Once reconstituted, peptide solutions should be stored at 2–8°C and used within
          the timeframe specified for each compound. Avoid repeated freeze-thaw cycles as this can
          degrade compound integrity. Keep all products away from direct light and moisture.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Reconstitution</p>
        <p style={bodyText}>
          Most lyophilized peptides can be reconstituted using bacteriostatic water or sterile water.
          Add the solvent slowly to the vial wall and allow the peptide to dissolve gently — do not
          shake or vortex vigorously. Refer to individual product pages for specific reconstitution
          volumes and solvent recommendations.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={{
          ...sectionHeading,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          Detailed Protocols
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: "8px",
              letterSpacing: "0.15em",
              color: colors.accent,
              border: `1px solid ${colors.accent}`,
              padding: "2px 8px",
              textTransform: "uppercase",
            }}
          >
            Coming Soon
          </span>
        </p>
        <p style={bodyText}>
          We are currently developing comprehensive, compound-specific research protocols for our
          full product catalogue. These will include detailed reconstitution guides, recommended
          storage conditions, stability data, and suggested research applications. Check back soon
          or contact us via WhatsApp for protocol inquiries on specific products.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
