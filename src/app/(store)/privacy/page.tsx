"use client";

import { cipherTokens } from "@/concepts/cipher/tokens";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";

const { typography } = cipherTokens;

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Data Collection</p>
        <p style={bodyText}>
          We collect personal information that you voluntarily provide when placing an order,
          including your name, email address, shipping address, and phone number. We also collect
          payment information which is processed securely through our third-party payment provider
          and is never stored on our servers.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>How We Use Your Data</p>
        <p style={bodyText}>
          Your information is used to process and fulfill orders, send order confirmations and
          shipping notifications, communicate about your account or transactions, and improve our
          products and services. We do not sell, trade, or rent your personal information to third
          parties for marketing purposes.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Cookies</p>
        <p style={bodyText}>
          Our website uses essential cookies to maintain your shopping cart and session state. We may
          also use analytics cookies to understand how visitors interact with our site. You can
          control cookie preferences through your browser settings. Disabling essential cookies may
          affect site functionality.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Third Parties</p>
        <p style={bodyText}>
          We share your information only with trusted third parties necessary to operate our
          business: payment processors for transaction handling, shipping carriers for order
          delivery, and email service providers for transactional communications. All third parties
          are contractually obligated to protect your data.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Your Rights</p>
        <p style={bodyText}>
          You have the right to access, correct, or delete your personal data at any time. You may
          also request a copy of all data we hold about you. To exercise any of these rights, please
          contact us via WhatsApp or email. We will respond to all requests within 30 days.
        </p>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeading}>Data Security</p>
        <p style={bodyText}>
          We implement industry-standard security measures to protect your personal information,
          including SSL encryption for all data transmission and secure storage practices. However,
          no method of electronic transmission or storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </div>

      <div style={{ marginTop: "48px" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
