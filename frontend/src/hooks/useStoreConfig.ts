import { useState, useEffect } from "react";

interface StoreConfig {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo: string | null;
}

const DEFAULT: StoreConfig = {
  name: "Maadtime",
  phone: "+221773043453",
  whatsapp: "221773043453",
  address: "",
  logo: null,
};

let cache: StoreConfig | null = null;
let fetchPromise: Promise<StoreConfig> | null = null;

async function fetchConfig(): Promise<StoreConfig> {
  if (cache) return cache;
  if (!fetchPromise) {
    const slug = process.env.NEXT_PUBLIC_STORE_SLUG || "maadtime";
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetchPromise = fetch(`${base}/stores/public/?slug=${slug}`)
      .then((r) => {
        if (!r.ok) return DEFAULT;
        return r.json();
      })
      .then((data: StoreConfig) => {
        // Vérifier que la réponse est un vrai store (pas une erreur DRF)
        if (!data?.name) return DEFAULT;
        cache = data;
        return data;
      })
      .catch(() => DEFAULT);
  }
  return fetchPromise;
}

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig>(cache ?? DEFAULT);

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  return config;
}

export function waLink(whatsapp: string | undefined | null, text?: string) {
  const num = (whatsapp ?? DEFAULT.whatsapp).replace(/\D/g, "");
  return text
    ? `https://wa.me/${num}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${num}`;
}
