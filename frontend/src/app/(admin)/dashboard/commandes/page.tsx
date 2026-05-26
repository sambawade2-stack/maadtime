"use client";

import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Order } from "@/types";
import { dashboardApi } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "processing", label: "En traitement" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await dashboardApi.allOrders(params);
      setOrders(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filterStatus, search]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    const interval = setInterval(() => { fetch(); }, 30_000);
    return () => clearInterval(interval);
  }, [filterStatus, search]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await dashboardApi.updateOrderStatus(id, status);
      toast.success("Statut mis à jour");
      fetch();
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold mb-6">Commandes</h1>

      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Numéro, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s.value
                    ? "bg-brand-green text-white"
                    : "bg-muted text-muted-foreground hover:bg-brand-beige"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["#Commande", "Client", "Région", "Articles", "Total", "Statut", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50 animate-pulse">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-8 bg-muted rounded" />
                    </td>
                  </tr>
                ))
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-brand-green text-xs">#{o.order_number}</p>
                    {o.store_name && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-brand-green/10 text-brand-green rounded-full font-medium">
                        {o.store_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.full_name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.city}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{o.items_count}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(o.status)}`}>
                      {o.status_display}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                    >
                      {STATUS_OPTIONS.filter(s => s.value).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">Aucune commande</p>
          )}
        </div>
      </div>
    </div>
  );
}
