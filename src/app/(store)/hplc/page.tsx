"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function HplcPage() {
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
        HPLC Reports
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>What is HPLC?</p>
        <p style={bodyText}>
          High-Performance Liquid Chromatography (HPLC) is the gold standard analytical method for
          determining the purity of peptides and research compounds. The technique separates
          components in a mixture based on their chemical properties, allowing precise identification
          and quantification of the target compound and any impurities.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Purity Standards</p>
        <p style={bodyText}>
          All Pure Peptides products undergo HPLC testing to verify purity levels. Our standard
          purity threshold is ≥98% for all peptide products. HPLC reports detail the percentage of
          the target compound present, along with any detected impurities and their relative
          concentrations. This ensures researchers can trust the quality and consistency of their
          materials.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Reading an HPLC Report</p>
        <p style={bodyText}>
          An HPLC report typically includes a chromatogram showing peaks that represent different
          components in the sample. The main peak corresponds to the target peptide, and its area
          relative to the total is expressed as the purity percentage. Reports also include retention
          time, detection wavelength, column specifications, and mobile phase composition used in the
          analysis.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Requesting HPLC Reports</p>
        <p style={bodyText}>
          HPLC purity reports are available on request for any product in our catalogue. To request a
          report, please contact us via WhatsApp with the product name and batch number (if
          available). We will provide the corresponding HPLC documentation within 24 hours.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
