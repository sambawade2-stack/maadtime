"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, MapPin, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/connexion"); return; }
    ordersApi.list().then((r) => setOrders(r.data.results || r.data));
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnexion réussie");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.email}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-brand-green">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Commandes</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-brand-green">
                {formatPrice(orders.reduce((a, o) => a + o.total, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total dépensé</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-brand-green">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-xs text-muted-foreground">Livrées</p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { href: "/profil/commandes", icon: Package, label: "Mes commandes" },
            { href: "/profil/favoris", icon: Heart, label: "Favoris" },
            { href: "#", icon: MapPin, label: "Adresses" },
            { href: "#", icon: User, label: "Modifier profil" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className="bg-white dark:bg-card rounded-2xl p-4 shadow-card text-center hover:shadow-premium transition-shadow"
            >
              <Icon className="w-6 h-6 text-brand-green mx-auto mb-2" />
              <p className="text-sm font-medium">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Commandes récentes</h2>
            <Link href="/profil/commandes" className="text-sm text-brand-green hover:underline">
              Voir tout
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">Aucune commande pour le moment</p>
              <Link href="/boutique" className="btn-primary mt-4 text-sm">
                Commencer les achats
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono font-bold text-sm text-brand-green">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(o.status)}`}>
                    {o.status_display}
                  </span>
                  <p className="font-semibold text-sm">{formatPrice(o.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
