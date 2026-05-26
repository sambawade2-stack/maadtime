"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowUpRight, ArrowDownRight,
  Store, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { dashboardApi, storesApi } from "@/lib/api";
import { DashboardStats, Order, StoreStats } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.is_superuser;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<StoreStats[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch stores list for superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      storesApi.overview().then((r) => setStores(r.data)).catch(() => {});
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = selectedStore ? { store: selectedStore } : undefined;
    Promise.all([
      dashboardApi.stats(params),
      dashboardApi.salesChart("month", params),
      dashboardApi.recentOrders(),
    ]).then(([s, c, o]) => {
      setStats(s.data);
      setChartData(c.data);
      setRecentOrders(o.data);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [selectedStore, retryCount]);

  const selectedStoreName = selectedStore
    ? stores.find((s) => s.id === selectedStore)?.name
    : null;

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Tableau de bord</h1>
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Impossible de charger les données</p>
          <p className="text-sm text-red-500 mb-4">Vérifiez que le backend est en ligne et que vous êtes connecté.</p>
          <button
            onClick={() => setRetryCount((n) => n + 1)}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    {
      label: "Revenu mensuel",
      value: formatPrice(stats.revenue.monthly),
      sub: `Total: ${formatPrice(stats.revenue.total)}`,
      icon: TrendingUp,
      color: "text-brand-green",
      trend: 12,
    },
    {
      label: "Revenu journalier",
      value: formatPrice(stats.revenue.daily ?? 0),
      sub: "Aujourd'hui",
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Commandes",
      value: stats.orders.total.toString(),
      sub: `${stats.orders.today} aujourd'hui`,
      icon: ShoppingBag,
      color: "text-blue-600",
      trend: 8,
    },
    {
      label: "Clients",
      value: stats.customers.total.toString(),
      sub: `+${stats.customers.new_month} ce mois`,
      icon: Users,
      color: "text-purple-600",
      trend: 5,
    },
    {
      label: "Produits",
      value: stats.products.total.toString(),
      sub: `${stats.products.low_stock} stock faible`,
      icon: Package,
      color: "text-orange-600",
    },
  ] : [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vue d&apos;ensemble {selectedStoreName ? `— ${selectedStoreName}` : isSuperAdmin ? "— Toutes les boutiques" : `de ${user?.store?.name || "Maadtime"}`}
          </p>
        </div>

        {/* Store selector (superadmin only) */}
        {isSuperAdmin && stores.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowStorePicker((v) => !v)}
              className="flex items-center gap-2 bg-white dark:bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-card hover:bg-muted/50 transition-colors"
            >
              <Store className="w-4 h-4 text-brand-green" />
              {selectedStoreName || "Toutes les boutiques"}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showStorePicker && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => { setSelectedStore(null); setShowStorePicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${!selectedStore ? "font-semibold text-brand-green" : ""}`}
                >
                  Toutes les boutiques
                </button>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStore(s.id); setShowStorePicker(false); }}
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
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, trend }: any, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-card rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {trend !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Alert stock */}
      {stats && stats.products.out_of_stock > 0 && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span><strong>{stats.products.out_of_stock}</strong> produit(s) en rupture de stock.</span>
          <a href="/dashboard/stocks" className="ml-auto underline text-sm">Gérer</a>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold mb-6">Évolution des ventes</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => new Date(v).toLocaleDateString("fr-SN", { month: "short" })}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v: number) => [formatPrice(v), "Revenu"]}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-semibold">Commandes récentes</h2>
          <a href="/dashboard/commandes" className="text-sm text-brand-green font-medium hover:underline">Voir toutes</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Commande", "Client", "Région", "Total", "Statut", "Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-green">#{order.order_number}</td>
                  <td className="px-6 py-4">{order.full_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.city}</td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Aucune commande récente</p>
          )}
        </div>
      </div>
    </div>
  );
}
