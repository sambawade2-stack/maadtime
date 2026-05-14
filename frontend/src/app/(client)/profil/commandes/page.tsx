"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CommandesPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/connexion"); return; }
    ordersApi.list().then((r) => {
      setOrders(r.data.results || r.data);
      setLoading(false);
    });
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige py-8">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profil" className="text-sm text-muted-foreground hover:text-brand-green">
            Profil
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Mes commandes</span>
        </div>

        <h1 className="font-display text-2xl font-bold mb-6">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de commande.</p>
            <Link href="/boutique" className="btn-primary text-sm">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white dark:bg-card rounded-2xl shadow-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-mono font-bold text-brand-green">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(o.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(o.status)}`}>
                    {o.status_display}
                  </span>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  <span>{o.items_count} article{(o.items_count || 0) > 1 ? "s" : ""}</span>
                  <span className="mx-2">•</span>
                  <span>{o.city}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-bold text-lg text-brand-green">{formatPrice(o.total)}</span>
                  <span className="text-xs text-muted-foreground bg-brand-beige px-3 py-1 rounded-full">
                    Paiement à la livraison
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
