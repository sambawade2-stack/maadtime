"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone } from "lucide-react";
import { User } from "@/types";
import { dashboardApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.customers().then((r) => {
      setClients(r.data.results || r.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Clients</h1>
        <div className="flex items-center gap-2 bg-white dark:bg-card rounded-xl px-4 py-2 shadow-card">
          <Users className="w-4 h-4 text-brand-green" />
          <span className="text-sm font-semibold">{clients.length} clients</span>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Email", "Téléphone", "Inscrit le"].map((h) => (
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
                    <td colSpan={4} className="px-5 py-3">
                      <div className="h-8 bg-muted rounded" />
                    </td>
                  </tr>
                ))
              ) : clients.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green font-bold text-sm">
                        {c.first_name?.[0] || c.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {c.email}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.phone || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(c.created_at)}</td>
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
