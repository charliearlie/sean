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

export const cipherTokens = {
  name: "PURE PEPTIDES",
  colors: darkColors,
  typography: {
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    monoFont: "var(--font-space-grotesk)",
  },
  spacing: {
    sectionPadding: "80px",
    cardPadding: "20px",
    gap: "16px",
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
    radius: "0px",
    width: "1px",
    style: "solid",
  },
};
