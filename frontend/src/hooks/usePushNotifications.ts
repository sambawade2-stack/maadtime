"use client";

import { useEffect, useRef } from "react";
import { dashboardApi } from "@/lib/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const setup = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");

        if (Notification.permission === "denied") return;

        const permission =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if (permission !== "granted") return;

        const { data } = await dashboardApi.getVapidPublicKey();
        const applicationServerKey = urlBase64ToUint8Array(data.public_key);

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        await dashboardApi.pushSubscribe(sub.toJSON());
        registered.current = true;
      } catch {
        // Silencieux — notifications non critiques
      }
    };

    setup();
  }, []);
}
