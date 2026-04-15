import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getProductBySlug } from "@/lib/data/products";
import ProductView from "@/concepts/cipher/components/ProductView";
import ResearchDisclaimer from "@/shared/components/ResearchDisclaimer";
import ProductChatProvider from "./ProductChatProvider";

export const revalidate = 300;

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true);
  return (data || []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Pure Peptides`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // For now, related products is empty - can be enhanced later with DB relations
  const relatedProducts: typeof product[] = [];

  return (
    <ProductChatProvider product={product}>
      <ProductView product={product} relatedProducts={relatedProducts} />
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 40px",
        }}
      >
        <ResearchDisclaimer />
      </div>
    </ProductChatProvider>
  );
}
