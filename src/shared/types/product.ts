export interface ProductVariant {
  id: string;
  label: string;
  dosage: string;
  price: number;
  sku: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  name_ar?: string;
  compoundCode: string;
  category: string;
  description: string;
  description_ar?: string;
  longDescription: string;
  longDescription_ar?: string;
  purity: number;
  molecularWeight: string;
  formFactor: string;
  sequence: string;
  variants: ProductVariant[];
  coaBatchNumber: string;
  imageUrl?: string | null;
  imageUrlDark?: string | null;
  featured: boolean;
  relatedSlugs: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  productCount: number;
}

