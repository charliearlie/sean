export default function UnderConstructionPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0D12",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.35em",
          color: "#00FFB2",
          textTransform: "uppercase",
          marginBottom: "32px",
        }}
      >
        PURE PEPTIDES
      </h1>

      <div
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: "#6B7280",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {"// STATUS"}
      </div>

      <h2
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#E5E7EB",
          marginBottom: "48px",
        }}
      >
        Under Construction
      </h2>

      <a
        href="/login?redirect=/"
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.15em",
          color: "#6B7280",
          textDecoration: "none",
          textTransform: "uppercase",
          padding: "10px 20px",
          border: "1px solid #374151",
          transition: "all 0.2s ease-in-out",
        }}
      >
        Admin Login →
      </a>
    </div>
  );
}
