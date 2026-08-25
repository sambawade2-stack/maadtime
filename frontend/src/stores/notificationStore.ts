import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WSNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  order_id: number;
  order_number: string;
  customer_name: string;
  total: number;
  read: boolean;
  created_at: string;
}

interface NotificationStore {
  // Legacy (polling)
  lastOrderId: number | null;
  setLastOrderId: (id: number) => void;

  // Notifications temps réel
  notifications: WSNotification[];
  newOrdersCount: number;
  soundEnabled: boolean;

  addNotification: (n: WSNotification) => void;
  setNotifications: (list: WSNotification[]) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  clearNewOrders: () => void;
  setNewOrdersCount: (count: number) => void;
  toggleSound: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      lastOrderId: null,
      setLastOrderId: (id) => set({ lastOrderId: id }),

      notifications: [],
      newOrdersCount: 0,
      soundEnabled: true,

      addNotification: (n) =>
        set((s) => ({
          notifications: [n, ...s.notifications].slice(0, 50),
          newOrdersCount: s.newOrdersCount + 1,
        })),

      setNotifications: (list) => set({ notifications: list }),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          newOrdersCount: 0,
        })),

      clearNewOrders: () => set({ newOrdersCount: 0 }),
      setNewOrdersCount: (count) => set({ newOrdersCount: count }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    { name: "maadtime-notifications" }
  )
);
