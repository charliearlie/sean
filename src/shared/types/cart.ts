import type { Product, ProductVariant } from "./product";

export interface CartItem {
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  miniCartOpen: boolean;
  lastAddedItem: { product: Product; variant: ProductVariant } | null;
}

export type CartAction =
  | { type: "ADD_ITEM"; product: Product; variant: ProductVariant }
  | { type: "REMOVE_ITEM"; productId: string; variantId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; variantId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "CLOSE_MINI_CART" }
  | { type: "OPEN_MINI_CART" }
  | { type: "SET_ITEMS"; items: CartItem[] };
