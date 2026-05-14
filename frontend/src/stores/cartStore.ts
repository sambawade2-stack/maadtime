import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }], isOpen: true });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),

      deliveryFee: () => {
        const sub = get().subtotal();
        return sub >= 20000 ? 0 : 1000;
      },

      total: () => get().subtotal() + get().deliveryFee(),
    }),
    {
      name: "maadtime-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
