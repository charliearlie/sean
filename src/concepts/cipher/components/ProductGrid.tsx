"use client";

import { motion } from "framer-motion";
import { cipherTokens } from "@/concepts/cipher/tokens";
import { staggerContainer } from "@/lib/motion";
import type { Product } from "@/shared/types/product";
import ProductCard from "@/concepts/cipher/components/ProductCard";
import { useColors } from "@/shared/context/ThemeContext";

const { motion: motionTokens } = cipherTokens;

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const colors = useColors();
  return (
    <motion.div
      key={products.map(p => p.id).join(',')}
      variants={staggerContainer(motionTokens.staggerChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1px",
      }}
    >
      {products.map((product) => (
        <div key={product.id} style={{ border: `1px solid ${colors.border}` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </motion.div>
  );
}
