"use client";

import { useEffect, useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminLivraisonsPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.deliveries(),
      dashboardApi.deliveryZones(),
    ]).then(([d, z]) => {
      setDeliveries(d.data.results || d.data);
      setZones(z.data.results || z.data);
      setLoading(false);
    });
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_transit: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "En attente",
    assigned: "Assignée",
    in_transit: "En transit",
    delivered: "Livrée",
    failed: "Échouée",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display text-2xl font-bold">Livraisons</h1>

      {/* Zones */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-green" />
          Zones de livraison
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {zones.map((z) => (
            <div key={z.id} className="bg-white dark:bg-card rounded-xl p-4 shadow-card">
              <p className="font-medium text-sm">{z.name}</p>
              <p className="text-xs text-muted-foreground">{z.city}</p>
              <p className="text-brand-green font-semibold mt-2 text-sm">
                {z.fee === 0 ? "Gratuite" : `${z.fee.toLocaleString()} FCFA`}
              </p>
              <p className="text-xs text-muted-foreground">{z.estimated_days} jours</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deliveries table */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-green" />
          <h2 className="font-semibold">Suivi des livraisons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Commande", "Zone", "Livreur", "Statut", "Livraison prévue"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50 animate-pulse">
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-8 bg-muted rounded" />
                    </td>
                  </tr>
                ))
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    Aucune livraison en cours
                  </td>
                </tr>
              ) : deliveries.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-brand-green text-xs">
                    #{d.order_number}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.zone_name || "—"}</td>
                  <td className="px-5 py-3">
                    {d.driver_name || <span className="text-muted-foreground/40">Non assigné</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] || "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABELS[d.status] || d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {d.estimated_delivery ? formatDate(d.estimated_delivery) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
