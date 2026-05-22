import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  isVeg: boolean;
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  tableNumber: number | null;
  lastOrderId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: number) => void;
  setLastOrderId: (id: number) => void;
  getTotal: () => number;
  getGST: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      lastOrderId: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),
      updateQuantity: (menuItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.menuItemId !== menuItemId) };
          }
          return {
            items: state.items.map((i) =>
              i.menuItemId === menuItemId ? { ...i, quantity } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setLastOrderId: (id) => set({ lastOrderId: id }),
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getGST: () => {
        return get().getSubtotal() * 0.05;
      },
      getTotal: () => {
        return get().getSubtotal() + get().getGST();
      },
    }),
    {
      name: 'crc-cart-storage',
    }
  )
);
