"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function CoaPage() {
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
        Certificate of Analysis
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>What is a COA?</p>
        <p style={bodyText}>
          A Certificate of Analysis (COA) is a document issued by an accredited laboratory that
          confirms the identity, purity, and composition of a research compound. Each COA includes
          the results of analytical testing performed on a specific batch, ensuring that the product
          meets the stated specifications.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Our Commitment to Quality</p>
        <p style={bodyText}>
          Every product in our catalogue is backed by third-party analytical testing. We work with
          independent laboratories to verify the purity and identity of all compounds before they are
          made available for purchase. Our quality assurance process ensures that researchers receive
          materials that meet the highest standards of accuracy and consistency.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>What&apos;s Included</p>
        <p style={bodyText}>
          Each COA typically includes HPLC purity analysis, mass spectrometry confirmation, amino
          acid sequence verification (for peptides), appearance and solubility data, batch number and
          manufacturing date, and storage recommendations. The specific tests may vary depending on
          the type of compound.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Requesting a COA</p>
        <p style={bodyText}>
          Certificates of Analysis are available on request for any product in our catalogue. To
          request a COA, please contact us via WhatsApp with the product name and batch number (if
          available). We will provide the corresponding COA document within 24 hours.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
