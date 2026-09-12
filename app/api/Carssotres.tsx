"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Product {
  id: number;
  name: string;
  price: number;
  qty?: number; // optional fix
  model?: string; // optional fix
}

interface CartState {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      // 🛒 ADD TO CART (DEFAULT QTY = 1 FIXED)
      addToCart: (product) => {
        const cart = get().cart;

        const existing = cart.find((p) => p.id === product.id);

        if (existing) {
          set({
            cart: cart.map((p) =>
              p.id === product.id
                ? { ...p, qty: (p.qty || 1) + 1 }
                : p
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                ...product,
                qty: 1, // 🔥 DEFAULT VALUE FIX HERE
              },
            ],
          });
        }
      },

      // ❌ REMOVE
      removeFromCart: (id) => {
        set({
          cart: get().cart.filter((p) => p.id !== id),
        });
      },

      // ➕➖ UPDATE QTY
      updateQty: (id, qty) => {
        if (qty < 1) return;

        set({
          cart: get().cart.map((p) =>
            p.id === id ? { ...p, qty } : p
          ),
        });
      },

      // 🧹 CLEAR CART
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
