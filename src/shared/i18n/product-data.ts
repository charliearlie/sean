import type { Product, Category } from "@/shared/types/product";

type Locale = "en" | "ar";

export function getLocalizedProduct(product: Product, locale: Locale): Product {
  if (locale !== "ar") return product;
  return {
    ...product,
    name: product.name_ar || product.name,
    description: product.description_ar || product.description,
    longDescription: product.longDescription_ar || product.longDescription,
  };
}

export function getLocalizedCategory(category: Category, locale: Locale): Category {
  if (locale !== "ar") return category;
  return {
    ...category,
    name: category.name_ar || category.name,
    description: category.description_ar || category.description,
  };
}
