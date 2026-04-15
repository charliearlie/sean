import { redirect } from "next/navigation";
import { getOrdersByCustomer } from "@/lib/data/orders";

export const dynamic = "force-dynamic";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { formatAED } from "@/shared/utils/currency";
import AccountNav from "@/concepts/cipher/components/AccountNav";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import Link from "next/link";

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

export default async function AccountDashboard() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get recent orders
  let orders: Awaited<ReturnType<typeof getOrdersByCustomer>> = [];
  try {
    orders = await getOrdersByCustomer(user.id);
  } catch {
    // No orders yet
  }

  const recentOrders = orders.slice(0, 5);
  const totalOrders = orders.length;
  const lastOrderDate = orders[0]
    ? new Date(orders[0].created_at).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email;

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
          DASHBOARD
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

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Welcome */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              padding: "24px",
            }}
          >
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Welcome Back
            </p>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "16px",
                color: colors.accent,
                fontWeight: 700,
              }}
            >
              {displayName}
            </p>
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                border: `1px solid ${colors.border}`,
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Total Orders
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "24px",
                  color: colors.foreground,
                  fontWeight: 700,
                }}
              >
                {totalOrders}
              </p>
            </div>
            <div
              style={{
                border: `1px solid ${colors.border}`,
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Last Order
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "14px",
                  color: colors.foreground,
                  fontWeight: 600,
                }}
              >
                {lastOrderDate}
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Link
              href="/account/orders"
              style={{
                border: `1px solid ${colors.border}`,
                padding: "20px",
                textDecoration: "none",
                transition: "border-color 0.2s ease-in-out",
              }}


            >
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: colors.accent,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Orders
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  color: colors.mutedForeground,
                }}
              >
                View order history and tracking
              </p>
            </Link>
            <Link
              href="/account/profile"
              style={{
                border: `1px solid ${colors.border}`,
                padding: "20px",
                textDecoration: "none",
                transition: "border-color 0.2s ease-in-out",
              }}


            >
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: colors.accent,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Profile
              </p>
              <p
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  color: colors.mutedForeground,
                }}
              >
                Edit account details
              </p>
            </Link>
          </div>

          {/* Recent orders */}
          {recentOrders.length > 0 && (
            <div style={{ border: `1px solid ${colors.border}` }}>
              <div
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  padding: "10px 16px",
                  background: colors.muted,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Recent Orders
              </div>
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: `1px solid ${colors.border}`,
                    textDecoration: "none",
                    transition: "background 0.2s ease-in-out",
                  }}


                >
                  <span
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "12px",
                      color: colors.accent,
                      fontWeight: 600,
                    }}
                  >
                    {order.order_number}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.monoFont,
                      fontSize: "12px",
                      color: colors.foreground,
                      fontWeight: 600,
                    }}
                  >
                    {formatAED(order.total)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 0 0",
        }}
      >
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
