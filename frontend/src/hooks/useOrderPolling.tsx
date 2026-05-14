"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/api";
import { useNotificationStore } from "@/stores/notificationStore";

const POLL_INTERVAL = 30_000; // 30 secondes

export function useOrderPolling() {
  const { lastOrderId, setLastOrderId, setNewOrdersCount, newOrdersCount } =
    useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await dashboardApi.recentOrders();
        const orders: any[] = data || [];
        if (orders.length === 0) return;

        const latestId = orders[0]?.id;

        if (!initialized.current) {
          // Premier chargement : on mémorise sans notifier
          setLastOrderId(latestId);
          initialized.current = true;
          return;
        }

        if (lastOrderId !== null && latestId > lastOrderId) {
          const newCount = orders.filter((o: any) => o.id > lastOrderId).length;
          setLastOrderId(latestId);
          setNewOrdersCount(newOrdersCount + newCount);

          toast(
            (t) => (
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  window.location.href = "/dashboard/commandes";
                  toast.dismiss(t.id);
                }}
              >
                <span className="text-2xl">🛍️</span>
                <div>
                  <p className="font-bold text-sm">
                    {newCount} nouvelle{newCount > 1 ? "s" : ""} commande
                    {newCount > 1 ? "s" : ""} !
                  </p>
                  <p className="text-xs text-muted-foreground">Cliquer pour voir</p>
                </div>
              </div>
            ),
            {
              duration: 8000,
              style: { padding: "12px 16px", borderLeft: "4px solid #2E7D32" },
            }
          );
        }
      } catch {
        // Silencieux si la requête échoue (ex: déconnecté)
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line
}
