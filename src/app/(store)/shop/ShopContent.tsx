"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cipherTokens } from "@/concepts/cipher/tokens";
import CategoryNav from "@/concepts/cipher/components/CategoryNav";
import ProductGrid from "@/concepts/cipher/components/ProductGrid";
import MotionWrapper from "@/concepts/cipher/components/MotionWrapper";
import AgeVerificationBanner from "@/shared/components/AgeVerificationBanner";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import { useColors } from "@/shared/context/ThemeContext";
import type { Product, Category } from "@/shared/types/product";

const { typography } = cipherTokens;

type SortKey = "name" | "price-asc" | "price-desc" | "purity";

interface ShopContentProps {
  products: Product[];
  categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
  return (
    <Suspense>
      <ShopContentInner products={products} categories={categories} />
    </Suspense>
  );
}

function ShopContentInner({ products, categories }: ShopContentProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? undefined;
  const colors = useColors();

  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    initialCategory
  );
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const list = activeCategory
      ? products.filter((p) => p.category === activeCategory)
      : [...products];

    switch (sortKey) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        list.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
        break;
      case "price-desc":
        list.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
        break;
      case "purity":
        list.sort((a, b) => b.purity - a.purity);
        break;
    }

    return list;
  }, [products, activeCategory, sortKey]);

  return (
    <>
      <AgeVerificationBanner />

      <div style={{ paddingTop: "56px" }}>
        {/* Page header */}
        <div
          style={{
            borderBottom: `1px solid ${colors.border}`,
            padding: "40px 24px 0",
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <MotionWrapper>
            <p
              style={{
                fontFamily: typography.monoFont,
                fontSize: "10px",
                letterSpacing: "0.3em",
                color: colors.mutedForeground,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {/* Compound Catalogue */}
            </p>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: colors.foreground,
                marginBottom: "24px",
              }}
            >
              Research Inventory
            </h1>
          </MotionWrapper>

          <CategoryNav
            categories={categories}
            activeSlug={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Sort controls */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: typography.monoFont,
              fontSize: "11px",
              color: colors.mutedForeground,
            }}
          >
            {filtered.length} compound{filtered.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: "0px" }}>
            {(
              [
                { key: "name", label: "Name" },
                { key: "price-asc", label: "Price ↑" },
                { key: "price-desc", label: "Price ↓" },
                { key: "purity", label: "Purity" },
              ] as { key: SortKey; label: string }[]
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setSortKey(s.key)}
                style={{
                  fontFamily: typography.monoFont,
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color:
                    sortKey === s.key ? colors.accent : colors.mutedForeground,
                  background: "transparent",
                  border: `1px solid ${sortKey === s.key ? colors.accent : colors.border}`,
                  borderRight:
                    s.key === "purity"
                      ? `1px solid ${sortKey === s.key ? colors.accent : colors.border}`
                      : "none",
                  padding: "8px 14px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px 64px",
          }}
        >
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div
              style={{
                padding: "80px 24px",
                textAlign: "center",
                fontFamily: typography.monoFont,
                fontSize: "13px",
                color: colors.mutedForeground,
              }}
            >
              No compounds found in this category.
            </div>
          )}
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px 40px",
          }}
        >
          <ResearchDisclaimer />
        </div>
      </div>
    </>
  );
}
