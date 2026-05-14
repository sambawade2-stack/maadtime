import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationStore {
  lastOrderId: number | null;
  newOrdersCount: number;
  setLastOrderId: (id: number) => void;
  setNewOrdersCount: (count: number) => void;
  clearNewOrders: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      lastOrderId: null,
      newOrdersCount: 0,
      setLastOrderId: (id) => set({ lastOrderId: id }),
      setNewOrdersCount: (count) => set({ newOrdersCount: count }),
      clearNewOrders: () => set({ newOrdersCount: 0 }),
    }),
    { name: "maadtime-notifications" }
  )
);
