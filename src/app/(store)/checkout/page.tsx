"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/shared/context/CartContext";
import CheckoutView, { type CheckoutFormData } from "@/concepts/cipher/components/CheckoutView";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function CipherCheckoutPage() {
  const router = useRouter();
  const { state } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Track auth state and fetch profile for form pre-fill
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchProfile(data.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (state.items.length === 0) {
      router.replace("/cart");
    }
  }, [state.items.length, router]);

  const handleSubmit = async (formData: CheckoutFormData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: state.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantLabel: item.variant.label,
          sku: item.variant.sku,
          quantity: item.quantity,
          unitPrice: item.variant.price,
        })),
        contact: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          emirate: formData.emirate,
          postalCode: formData.postalCode,
        },
      };

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to create payment session.");
        setLoading(false);
        return;
      }

      if (data.orderUrl) {
        window.location.href = data.orderUrl;
      } else {
        setError("No payment URL received. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return null;
  }

  return (
    <>
      <CheckoutView onSubmit={handleSubmit} loading={loading} error={error} user={user} profile={profile} />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 40px" }}>
        <ResearchDisclaimer />
      </div>
    </>
  );
}
