"use client";

import { createContext, useContext, useEffect, useReducer, useState, useCallback, useMemo, type ReactNode } from "react";
import type { CartState, CartAction } from "@/shared/types/cart";
import type { Product, ProductVariant } from "@/shared/types/product";
import { formatAED } from "@/shared/utils/currency";

const defaultState: CartState = { items: [], miniCartOpen: false, lastAddedItem: null };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.product.id && i.variantId === action.variant.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.product.id && i.variantId === action.variant.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          miniCartOpen: true,
          lastAddedItem: { product: action.product, variant: action.variant },
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: action.product.id,
            variantId: action.variant.id,
            product: action.product,
            variant: action.variant,
            quantity: 1,
          },
        ],
        miniCartOpen: true,
        lastAddedItem: { product: action.product, variant: action.variant },
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.productId === action.productId && i.variantId === action.variantId)
        ),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.productId === action.productId && i.variantId === action.variantId)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId && i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "CLOSE_MINI_CART":
      return { ...state, miniCartOpen: false, lastAddedItem: null };
    case "OPEN_MINI_CART":
      return { ...state, miniCartOpen: true, lastAddedItem: null };
    case "SET_ITEMS":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  closeMiniCart: () => void;
  openMiniCart: () => void;
  miniCartOpen: boolean;
  lastAddedItem: CartState["lastAddedItem"];
  totalItems: number;
  totalPrice: number;
  formattedTotal: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pep-cart');
      if (saved) {
        dispatch({ type: "SET_ITEMS", items: JSON.parse(saved) });
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes (only after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('pep-cart', JSON.stringify(state.items));
    }
  }, [state.items, hydrated]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  const addItem = useCallback((product: Product, variant: ProductVariant) => dispatch({ type: "ADD_ITEM", product, variant }), []);
  const removeItem = useCallback((productId: string, variantId: string) => dispatch({ type: "REMOVE_ITEM", productId, variantId }), []);
  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", productId, variantId, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const closeMiniCart = useCallback(() => dispatch({ type: "CLOSE_MINI_CART" }), []);
  const openMiniCart = useCallback(() => dispatch({ type: "OPEN_MINI_CART" }), []);

  const value = useMemo<CartContextValue>(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    closeMiniCart,
    openMiniCart,
    miniCartOpen: state.miniCartOpen,
    lastAddedItem: state.lastAddedItem,
    totalItems,
    totalPrice,
    formattedTotal: formatAED(totalPrice),
  }), [state, addItem, removeItem, updateQuantity, clearCart, closeMiniCart, openMiniCart, totalItems, totalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
