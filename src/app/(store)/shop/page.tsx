import { getProducts, getCategories } from "@/lib/data/products";
import ShopContent from "./ShopContent";

export const revalidate = 300;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <ShopContent products={products} categories={categories} />;
}
