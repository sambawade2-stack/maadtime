"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, MapPin, UserCheck, User as UserIcon } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

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
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.customers().then((r) => {
      setClients(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const registered = clients.filter((c) => c.type === "registered").length;
  const guests = clients.filter((c) => c.type === "guest").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Clients</h1>
        <div className="flex items-center gap-3">
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

      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Contact", "Ville", "Commandes", "Depuis le"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50 animate-pulse">
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-8 bg-muted rounded" />
                    </td>
                  </tr>
                ))
              ) : clients.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        c.type === "registered"
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-blue-50 text-blue-500"
                      }`}>
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{c.name || "—"}</p>
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
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Phone className="w-3 h-3" />
                          {c.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.city ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3 h-3" />
                        {c.city}
                      </div>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold">{c.orders_count}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && clients.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">Aucun client</p>
          )}
        </div>
      </div>
    </div>
  );
}
