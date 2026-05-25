"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, MapPin, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ordersApi, authApi } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdData, setPwdData] = useState({ old_password: "", new_password: "", confirm: "" });

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/connexion"); return; }
    ordersApi.list().then((r) => setOrders(r.data.results || r.data));
  }, [isAuthenticated, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.new_password !== pwdData.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (pwdData.new_password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPwdLoading(true);
    try {
      await authApi.changePassword(pwdData.old_password, pwdData.new_password);
      toast.success("Mot de passe modifié avec succès !");
      setPwdData({ old_password: "", new_password: "", confirm: "" });
      setShowPwdForm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.old_password?.[0] || err?.response?.data?.detail || "Erreur lors du changement.";
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

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

        {/* Change password */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-card mb-6 overflow-hidden">
          <button
            onClick={() => setShowPwdForm(!showPwdForm)}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-green" />
              <span className="font-semibold text-sm">Changer le mot de passe</span>
            </div>
            <span className="text-xs text-muted-foreground">{showPwdForm ? "Fermer" : "Modifier"}</span>
          </button>
          {showPwdForm && (
            <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3 border-t border-border pt-4">
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Ancien mot de passe"
                  value={pwdData.old_password}
                  onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={pwdData.new_password}
                  onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                value={pwdData.confirm}
                onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          )}
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
