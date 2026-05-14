"use client";

import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#2E7D32", "#6AA84F", "#D4A373", "#A67C52", "#F8F4EC"];

type Period = "today" | "week" | "month" | "custom";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "custom", label: "Personnalisé" },
];

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [dateFrom, setDateFrom] = useState(todayStr());
  const [dateTo, setDateTo] = useState(todayStr());

  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getRange = useCallback((p: Period): { from: string; to: string } => {
    const today = todayStr();
    if (p === "today") return { from: today, to: today };
    if (p === "week") return { from: nDaysAgo(6), to: today };
    if (p === "month") return { from: nDaysAgo(29), to: today };
    return { from: dateFrom, to: dateTo };
  }, [dateFrom, dateTo]);

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = getRange(period);
    const params = { date_from: from, date_to: to };
    const chartPeriod = period === "month" ? "month" : "week";
    try {
      const [s, c, t] = await Promise.all([
        dashboardApi.stats(params),
        dashboardApi.salesChart(chartPeriod, params),
        dashboardApi.topProducts(params),
      ]);
      setStats(s.data);
      setChartData(c.data);
      setTopProducts(t.data.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, [period, getRange]);

  useEffect(() => {
    if (period !== "custom") load();
  }, [period, load]);

  const handleCustomApply = () => load();

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "";

  const statusData = stats?.orders?.by_status?.map((s: any) => ({
    name: statusLabels[s.status] ?? s.status,
    value: s.count,
  })) || [];

  const cards = stats ? [
    {
      label: "Revenu",
      value: formatPrice(stats.revenue.total),
      icon: TrendingUp,
      color: "text-brand-green",
      bg: "bg-brand-green/10",
    },
    {
      label: "Commandes",
      value: stats.orders.period ?? stats.orders.total,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Clients",
      value: stats.customers.total,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Produits actifs",
      value: stats.products.total,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ] : [];

  const formatChartDate = (v: string) => {
    if (!v) return "";
    const d = new Date(v);
    if (period === "month") return d.toLocaleDateString("fr-SN", { month: "short", year: "2-digit" });
    if (period === "today") return d.toLocaleDateString("fr-SN", { day: "2-digit", month: "short" });
    return d.toLocaleDateString("fr-SN", { weekday: "short", day: "numeric" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="font-display text-2xl font-bold flex-1">Analytics</h1>

        {/* Period selector */}
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === opt.value
                  ? "bg-brand-green text-white"
                  : "bg-white dark:bg-card border border-border text-muted-foreground hover:border-brand-green hover:text-brand-green"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date picker */}
      {period === "custom" && (
        <div className="flex flex-wrap gap-3 items-end bg-white dark:bg-card rounded-2xl p-4 shadow-card">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Du</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Au</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={todayStr()}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-card rounded-2xl p-5 shadow-card animate-pulse h-24" />
            ))
          : cards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white dark:bg-card rounded-2xl p-5 shadow-card">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{periodLabel}</p>
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold mb-5 text-sm">
            Revenus — {periodLabel}
          </h2>
          {loading ? (
            <div className="h-[220px] bg-muted rounded-xl animate-pulse" />
          ) : chartData.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-16">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatChartDate}
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={70}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), "Revenu"]}
                  labelFormatter={formatChartDate}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold mb-5 text-sm">Distribution des statuts</h2>
          {loading ? (
            <div className="h-[220px] bg-muted rounded-xl animate-pulse" />
          ) : statusData.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-16">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {statusData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold mb-5 text-sm">Produits les plus vendus — {periodLabel}</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune vente sur cette période</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-green/10 text-brand-green text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.product__name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-brand-green">{p.total_sold} vendus</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.revenue)}</p>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-brand-green rounded-full"
                    style={{ width: `${Math.min(100, (p.total_sold / (topProducts[0]?.total_sold || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
