"use client";

import { useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useNotificationStore, WSNotification } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";

const RECONNECT_DELAY = 4000; // ms avant retry après déconnexion

function playSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // navigateur bloque l'audio — silencieux
  }
}

export function useNotifications() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);

  const { addNotification, soundEnabled } = useNotificationStore();
  const { user } = useAuthStore();

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const token = Cookies.get("access_token");
    if (!token || !user?.is_staff && user?.role !== "admin") return;

    const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
    const host = typeof window !== "undefined" ? window.location.host : "";
    const url = `${protocol}://${host}/ws/notifications/?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // Connexion établie — annule tout retry en cours
      clearTimeout(retryRef.current);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type !== "new_order") return;

        const notif: WSNotification = { ...data.notification, read: false };
        addNotification(notif);

        if (soundEnabled) playSound();

        const totalFormatted = Number(notif.total).toLocaleString("fr-FR");
        toast.success(
          `🛍️ Nouvelle commande !\n${notif.customer_name} — ${totalFormatted} FCFA`,
          {
            duration: 8000,
            style: { padding: "12px 16px", borderLeft: "4px solid #2E7D32", cursor: "pointer" },
            onClick() { window.location.href = "/dashboard/commandes"; },
          } as any
        );
      } catch {
        // message malformé — ignorer
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      // Reconnexion automatique après délai
      retryRef.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [user, soundEnabled, addNotification]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
