"use client";
import CartView from "@/concepts/cipher/components/CartView";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";

export default function CipherCartPage() {
  return (
    <>
      <CartView />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 40px" }}>
        <ResearchDisclaimer />
      </div>
    </>
  );
}
