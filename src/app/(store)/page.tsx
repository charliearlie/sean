import { getFeaturedProducts, getCategories, getMostPopularProduct } from "@/lib/data/products";
import HomeContent from "./HomeContent";

export default async function HomePage() {
  const [featured, categories, mostPopular] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getMostPopularProduct(),
  ]);

  return <HomeContent featured={featured} categories={categories} mostPopular={mostPopular} />;
}
