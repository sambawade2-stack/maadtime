"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Truck,
  BarChart3, Leaf, LogOut, Menu, X, AlertTriangle, Tag, Bell, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useOrderPolling } from "@/hooks/useOrderPolling";

const navSections = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Boutique",
    items: [
      { href: "/dashboard/produits", label: "Produits", icon: Package },
      { href: "/dashboard/categories", label: "Catégories", icon: Tag },
      { href: "/dashboard/stocks", label: "Stocks", icon: AlertTriangle },
    ],
  },
  {
    label: "Ventes",
    items: [
      { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag, badge: true },
      { href: "/dashboard/livraisons", label: "Livraisons", icon: Truck },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Rapports",
    items: [{ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { newOrdersCount, clearNewOrders } = useNotificationStore();

  useOrderPolling();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/auth/connexion");
    } else if (user.role !== "admin" && !user.is_staff) {
      router.replace("/");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || (user.role !== "admin" && !user.is_staff)) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/auth/connexion");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-foreground dark:bg-card text-background">
      {/* Logo */}
      <div className="p-6 border-b border-background/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-background leading-none">Maadtime</p>
            <p className="text-[10px] text-background/50 mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-background/30 px-3 mb-1">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge }: any) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                const showBadge = badge && newOrdersCount > 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      setSidebarOpen(false);
                      if (badge) clearNewOrders();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-green text-white"
                        : "text-background/60 hover:bg-background/10 hover:text-background"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{label}</span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {newOrdersCount > 99 ? "99+" : newOrdersCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-background/10">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {user.first_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-background truncate">
                {user.first_name || user.email}
              </p>
              <p className="text-xs text-background/50">Administrateur</p>
            </div>
          </div>
        )}
        <Link
          href="/dashboard/profil"
          className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors px-3 py-2 w-full rounded-xl hover:bg-background/10 mb-1"
        >
          <UserCircle className="w-4 h-4" />
          Mon profil
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-background/60 hover:text-red-400 transition-colors px-3 py-2 w-full rounded-xl hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted dark:bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-card border-b border-border flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />

          {/* Cloche notifications */}
          {newOrdersCount > 0 && (
            <Link
              href="/dashboard/commandes"
              onClick={clearNewOrders}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-red-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {newOrdersCount > 99 ? "99+" : newOrdersCount}
              </span>
            </Link>
          )}

          <Link href="/" className="text-sm text-muted-foreground hover:text-brand-green transition-colors">
            Voir le site →
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
