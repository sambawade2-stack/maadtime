"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, MapPin, UserCheck, User as UserIcon, Store, ChevronDown } from "lucide-react";
import { dashboardApi, storesApi } from "@/lib/api";
import { StoreStats } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface Customer {
  id: string;
  type: "registered" | "guest";
  name: string;
  email: string;
  phone: string;
  city: string;
  orders_count: number;
  created_at: string | null;
}

export default function AdminClientsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.is_superuser;

  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreStats[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      storesApi.overview().then((r) => setStores(r.data)).catch(() => {});
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    setLoading(true);
    const params = selectedStore ? { store: selectedStore } : undefined;
    dashboardApi.customers(params)
      .then((r) => { setClients(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedStore]);

  const registered = clients.filter((c) => c.type === "registered").length;
  const guests = clients.filter((c) => c.type === "guest").length;
  const selectedStoreName = selectedStore ? stores.find((s) => s.id === selectedStore)?.name : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {selectedStoreName ? `Boutique : ${selectedStoreName}` : isSuperAdmin ? "Toutes les boutiques" : user?.store?.name}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Store selector (superadmin only) */}
          {isSuperAdmin && stores.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="flex items-center gap-2 bg-white dark:bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium shadow-card hover:bg-muted/50 transition-colors"
              >
                <Store className="w-4 h-4 text-brand-green" />
                {selectedStoreName || "Toutes les boutiques"}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showPicker && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => { setSelectedStore(null); setShowPicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${!selectedStore ? "font-semibold text-brand-green" : ""}`}
                  >
                    Toutes les boutiques
                  </button>
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedStore(s.id); setShowPicker(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${selectedStore === s.id ? "font-semibold text-brand-green" : ""}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-brand-green shrink-0" />
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Counters */}
          <div className="flex items-center gap-2 bg-white dark:bg-card rounded-xl px-4 py-2 shadow-card text-sm">
            <UserCheck className="w-4 h-4 text-brand-green" />
            <span className="font-semibold">{registered}</span>
            <span className="text-muted-foreground">inscrits</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-card rounded-xl px-4 py-2 shadow-card text-sm">
            <UserIcon className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">{guests}</span>
            <span className="text-muted-foreground">invités</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Contact", "Ville", "Commandes", "Depuis le"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50 animate-pulse">
                    <td colSpan={5} className="px-5 py-3"><div className="h-8 bg-muted rounded" /></td>
                  </tr>
                ))
              ) : clients.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        c.type === "registered" ? "bg-brand-green/10 text-brand-green" : "bg-blue-50 text-blue-500"
                      }`}>
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{c.name || "—"}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          c.type === "registered"
                            ? "bg-brand-green/10 text-brand-green"
                            : "bg-blue-50 text-blue-400"
                        }`}>
                          {c.type === "registered" ? "Inscrit" : "Invité"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Mail className="w-3 h-3 shrink-0" />{c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Phone className="w-3 h-3 shrink-0" />{c.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">
                    {c.city ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3 h-3" />{c.city}
                      </div>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold">{c.orders_count}</span>
                    <span className="text-muted-foreground text-xs ml-1">commande{c.orders_count > 1 ? "s" : ""}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && clients.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucun client{selectedStoreName ? ` pour ${selectedStoreName}` : ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
