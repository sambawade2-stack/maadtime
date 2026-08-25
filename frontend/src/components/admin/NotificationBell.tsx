"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ShoppingBag, Volume2, VolumeX, CheckCheck, X } from "lucide-react";
import Link from "next/link";
import { useNotificationStore, WSNotification } from "@/stores/notificationStore";
import { api } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

function formatPrice(n: number) {
  return `${Number(n).toLocaleString("fr-FR")} FCFA`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications, newOrdersCount, soundEnabled, markRead, markAllRead, clearNewOrders, toggleSound, setNotifications, setNewOrdersCount } =
    useNotificationStore();

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Charger les notifications non lues depuis l'API au montage
  useEffect(() => {
    api.get("/notifications/?unread=true").then(({ data }) => {
      const list: WSNotification[] = (Array.isArray(data) ? data : data.results ?? []).map(
        (n: any) => ({ ...n, read: false })
      );
      setNotifications(list);
      setNewOrdersCount(list.length);
    }).catch(() => {/* silencieux */});
  }, []); // eslint-disable-line

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all/");
    } catch { /* ignore */ }
    markAllRead();
    clearNewOrders();
  };

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Cloche */}
      <button
        onClick={handleOpen}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
          newOrdersCount > 0 ? "bg-red-50 hover:bg-red-100" : "hover:bg-muted"
        }`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${newOrdersCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
        {newOrdersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
            {newOrdersCount > 99 ? "99+" : newOrdersCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-green" />
              <span className="font-semibold text-sm">Notifications</span>
              {newOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                  {newOrdersCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Son ON/OFF */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? "Désactiver le son" : "Activer le son"}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-brand-green" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              {/* Tout marquer lu */}
              {newOrdersCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Tout marquer comme lu"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Aucune notification</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <NotifRow key={n.id} notif={n} onRead={() => markRead(n.id)} onClose={() => setOpen(false)} />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/dashboard/commandes"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-green font-medium hover:underline"
            >
              Voir toutes les commandes →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({ notif, onRead, onClose }: { notif: WSNotification; onRead: () => void; onClose: () => void }) {
  const handleClick = async () => {
    if (!notif.read) {
      try { await api.patch(`/notifications/${notif.id}/read/`); } catch { /* ignore */ }
      onRead();
    }
    onClose();
  };

  return (
    <Link
      href="/dashboard/commandes"
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${!notif.read ? "bg-brand-green/5" : ""}`}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? "bg-brand-green/10" : "bg-muted"}`}>
        <ShoppingBag className={`w-4 h-4 ${!notif.read ? "text-brand-green" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
          Commande #{notif.order_number}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {notif.customer_name} — {formatPrice(notif.total)}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.read && <span className="w-2 h-2 bg-brand-green rounded-full mt-2 shrink-0" />}
    </Link>
  );
}
