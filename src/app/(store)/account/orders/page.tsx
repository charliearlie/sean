import { redirect } from "next/navigation";
import { getOrdersByCustomer } from "@/lib/data/orders";
import { cipherTokens } from "@/concepts/cipher/tokens";
import AccountNav from "@/concepts/cipher/components/AccountNav";
import OrderHistory from "@/concepts/cipher/components/OrderHistory";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";

const { typography } = cipherTokens;

const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
};

export default async function OrdersPage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  let orders: Awaited<ReturnType<typeof getOrdersByCustomer>> = [];
  try {
    orders = await getOrdersByCustomer(user.id);
  } catch {
    // No orders yet
  }

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "136px 24px 80px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .cipher-account-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: "16px",
          marginBottom: "32px",
        }}
      >
        <p
          style={{
            fontFamily: typography.monoFont,
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: colors.mutedForeground,
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Account
        </p>
        <h1
          style={{
            fontFamily: typography.monoFont,
            fontSize: "22px",
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: "0.05em",
          }}
        >
          ORDER HISTORY
        </h1>
      </div>

      <div
        className="cipher-account-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <AccountNav />
        <OrderHistory orders={orders} />
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 0 0" }}>
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
