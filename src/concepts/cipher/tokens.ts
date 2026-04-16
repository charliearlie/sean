const darkColors = {
  background: "#0A0D12",
  foreground: "#E0E6ED",
  accent: "#00FFB2",
  accentForeground: "#0A0D12",
  muted: "#151922",
  mutedForeground: "#5A6577",
  border: "#1E2530",
  card: "#0F1318",
  cardForeground: "#C5CDD8",
};

export const lightColors = {
  background: "#FFFFFF",
  foreground: "#1A1D23",
  accent: "#00C896",
  accentForeground: "#FFFFFF",
  muted: "#F3F5F7",
  mutedForeground: "#6B7A8D",
  border: "#E2E6EB",
  card: "#F8F9FB",
  cardForeground: "#2D3847",
};

export function getColors(theme: "dark" | "light") {
  return theme === "light" ? lightColors : darkColors;
}

const glassEffects = {
  dark: {
    background: "rgba(15, 19, 24, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  light: {
    background: "rgba(248, 249, 251, 0.6)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
  },
  backdropFilter: "blur(16px)",
};

const glowEffects = {
  text: "0 0 40px rgba(0, 255, 178, 0.3), 0 0 80px rgba(0, 255, 178, 0.1)",
  textSubtle: "0 0 30px rgba(0, 255, 178, 0.15)",
  card: "0 0 20px rgba(0, 255, 178, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)",
  cardHover: "0 0 30px rgba(0, 255, 178, 0.2), 0 12px 40px rgba(0, 0, 0, 0.3)",
  button: "0 0 20px rgba(0, 255, 178, 0.3)",
};

export function getGlass(theme: "dark" | "light") {
  const t = theme === "light" ? glassEffects.light : glassEffects.dark;
  return { ...t, backdropFilter: glassEffects.backdropFilter };
}

export { glowEffects };

export const cipherTokens = {
  name: "PURE PEPTIDES",
  colors: darkColors,
  typography: {
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    monoFont: "var(--font-space-grotesk)",
  },
  spacing: {
    sectionPadding: "96px",
    cardPadding: "24px",
    gap: "24px",
  },
  motion: {
    duration: 0.45,
    ease: "easeInOut" as string | number[],
    staggerChildren: 0.06,
  },
  adminTypography: {
    bodyFont: "var(--font-geist-sans)",
    monoFont: "var(--font-space-grotesk)",
    labelSize: "11px",
    labelLetterSpacing: "0.08em",
    dataSize: "13px",
    headingSize: "24px",
    sectionHeaderSize: "11px",
    inputSize: "13px",
    buttonSize: "11px",
    buttonLetterSpacing: "0.1em",
  },
  adminColors: {
    mutedForeground: "#7B8A9E",
  },
  adminBorders: {
    radius: "4px",
  },
  borders: {
    radius: "12px",
    radiusSm: "8px",
    radiusLg: "16px",
    width: "1px",
    style: "solid",
  },
};
