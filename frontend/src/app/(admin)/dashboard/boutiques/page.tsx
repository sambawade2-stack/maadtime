"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Store, Plus, Users, Package, ShoppingBag,
  TrendingUp, CheckCircle, XCircle,
  Edit, Trash2, X, Eye, EyeOff, ChevronDown, ChevronUp,
  Calendar, BarChart2, AlertTriangle
} from "lucide-react";
import { storesApi } from "@/lib/api";
import { StoreStats, StoreUser } from "@/types";
import { formatPrice, REGIONS_SENEGAL } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "boutiques" | "gerants";

export default function BoutiquesPage() {
  const [tab, setTab] = useState<Tab>("boutiques");
  const [stores, setStores] = useState<StoreStats[]>([]);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreStats | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const [storeForm, setStoreForm] = useState({ name: "", phone: "", whatsapp: "", address: "", description: "", regions: [] as string[] });
  const [userForm, setUserForm] = useState({ email: "", password: "", first_name: "", last_name: "", store_id: "" });
  const [expandedStock, setExpandedStock] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([storesApi.overview(), storesApi.listUsers()]);
      setStores(s.data);
      setUsers(u.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storesApi.create(storeForm);
      toast.success("Boutique créée !");
      setShowStoreModal(false);
      setStoreForm({ name: "", phone: "", whatsapp: "", address: "", description: "", regions: [] });
      fetchAll();
    } catch {
      toast.error("Erreur lors de la création.");
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    try {
      await storesApi.update(editingStore.id, storeForm);
      toast.success("Boutique mise à jour !");
      setEditingStore(null);
      setShowStoreModal(false);
      fetchAll();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const openEdit = (store: StoreStats) => {
    setEditingStore(store);
    setStoreForm({ name: store.name, phone: store.phone, whatsapp: store.whatsapp, address: store.address, description: "", regions: store.regions || [] });
    setShowStoreModal(true);
  };

  const toggleRegion = (region: string) => {
    setStoreForm((f) => ({
      ...f,
      regions: f.regions.includes(region)
        ? f.regions.filter((r) => r !== region)
        : [...f.regions, region],
    }));
  };

  const handleDeleteStore = async (id: number, name: string) => {
    if (!confirm(`Supprimer la boutique "${name}" ? Cette action est irréversible.`)) return;
    try {
      await storesApi.delete(id);
      toast.success("Boutique supprimée.");
      fetchAll();
    } catch {
      toast.error("Impossible de supprimer.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storesApi.createUser({ ...userForm, store_id: Number(userForm.store_id) });
      toast.success("Gérant créé !");
      setShowUserModal(false);
      setUserForm({ email: "", password: "", first_name: "", last_name: "", store_id: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de la création.");
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    if (!confirm(`Supprimer le gérant "${email}" ?`)) return;
    try {
      await storesApi.deleteUser(id);
      toast.success("Gérant supprimé.");
      fetchAll();
    } catch {
      toast.error("Impossible de supprimer.");
    }
  };

  const totalRevenue = stores.reduce((a, s) => a + s.revenue_total, 0);
  const totalOrders = stores.reduce((a, s) => a + s.orders_total, 0);
  const totalProducts = stores.reduce((a, s) => a + s.products_total, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion des boutiques</h1>
          <p className="text-muted-foreground text-sm mt-1">{stores.length} boutique{stores.length > 1 ? "s" : ""} active{stores.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowUserModal(true); }} className="btn-secondary flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" /> Ajouter gérant
          </button>
          <button onClick={() => { setEditingStore(null); setStoreForm({ name: "", phone: "", whatsapp: "", address: "", description: "", regions: [] }); setShowStoreModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nouvelle boutique
          </button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Revenu total", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-brand-green" },
          { label: "Total commandes", value: totalOrders.toString(), icon: ShoppingBag, color: "text-blue-500" },
          { label: "Total produits", value: totalProducts.toString(), icon: Package, color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-display font-bold text-lg">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-6">
        {(["boutiques", "gerants"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-white dark:bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "boutiques" ? "Boutiques" : "Gérants"}
          </button>
        ))}
      </div>

      {/* Boutiques grid */}
      {tab === "boutiques" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />)
            : stores.map((store) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-border flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                        <Store className="w-5 h-5 text-brand-green" />
                      </div>
                      <div>
                        <p className="font-semibold">{store.name}</p>
                        {store.phone && <p className="text-xs text-muted-foreground">{store.phone}</p>}
                        {store.regions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {store.regions.map((r) => (
                              <span key={r} className="px-1.5 py-0.5 bg-brand-green/10 text-brand-green rounded text-[10px] font-medium">{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {store.is_active
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                      <button onClick={() => openEdit(store)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDeleteStore(store.id, store.name)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Revenus */}
                  <div className="px-5 pt-4 pb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5" /> Revenus
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-brand-green/8 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Aujourd&apos;hui</p>
                        <p className="font-bold text-brand-green text-sm">{formatPrice(store.revenue_daily)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Ce mois</p>
                        <p className="font-bold text-sm">{formatPrice(store.revenue_monthly)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Commandes */}
                  <div className="px-5 pb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> Commandes
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-xl p-2">
                        <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
                        <p className="font-bold text-sm mt-0.5">{store.orders_today}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-2">
                        <p className="text-xs text-muted-foreground">Semaine</p>
                        <p className="font-bold text-sm mt-0.5">{store.orders_week}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2">
                        <p className="text-xs text-amber-600">En attente</p>
                        <p className="font-bold text-sm mt-0.5 text-amber-600">{store.orders_pending}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stock par produit */}
                  <div className="px-5 pb-4 border-t border-border pt-3">
                    <button
                      onClick={() => setExpandedStock(expandedStock === store.id ? null : store.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Stock par produit
                        {store.out_of_stock > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                            {store.out_of_stock} rupture
                          </span>
                        )}
                        {store.low_stock > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold">
                            {store.low_stock} faible
                          </span>
                        )}
                      </span>
                      {expandedStock === store.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedStock === store.id && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {store.inventory.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">Aucun stock enregistré</p>
                        ) : store.inventory.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-muted/50">
                            <span className="truncate text-xs flex-1 mr-2">{item.product_name}</span>
                            <span className={`text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
                              item.stock === 0
                                ? "bg-red-100 text-red-600"
                                : item.stock <= 5
                                ? "bg-amber-100 text-amber-600"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {item.stock === 0 ? "Rupture" : `${item.stock} unité${item.stock > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedStock !== store.id && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className={store.out_of_stock > 0 ? "text-red-500 font-medium" : "text-green-600"}>
                          {store.out_of_stock} rupture
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className={store.low_stock > 0 ? "text-amber-500 font-medium" : "text-green-600"}>
                          {store.low_stock} faible
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{store.inventory.length} produit{store.inventory.length > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
        </div>
      )}

      {/* Gérants tab */}
      {tab === "gerants" && (
        <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="text-left p-4">Gérant</th>
                <th className="text-left p-4">Boutique</th>
                <th className="text-left p-4">Email</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan={4} className="p-4"><div className="h-5 bg-muted rounded animate-pulse" /></td></tr>
                  ))
                : users.length === 0
                ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun gérant. Créez-en un avec "Ajouter gérant".</td></tr>
                  )
                : users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green font-bold text-sm">
                            {u.first_name?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.store
                          ? <span className="px-2 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-medium">{u.store.name}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal boutique */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold">{editingStore ? "Modifier la boutique" : "Nouvelle boutique"}</h2>
              <button onClick={() => setShowStoreModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={editingStore ? handleUpdateStore : handleCreateStore} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom de la boutique *</label>
                <input required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  placeholder="Ex: Maadtime Dakar" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Téléphone</label>
                  <input value={storeForm.phone} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    placeholder="+221 77 ..." className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">WhatsApp</label>
                  <input value={storeForm.whatsapp} onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                    placeholder="+221773..." className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Adresse</label>
                <input value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  placeholder="Dakar, Sénégal" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Régions couvertes
                  <span className="ml-2 text-xs font-normal text-muted-foreground">— les commandes de ces régions seront assignées à cette boutique</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS_SENEGAL.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRegion(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        storeForm.regions.includes(r)
                          ? "bg-brand-green text-white border-brand-green"
                          : "border-border text-muted-foreground hover:border-brand-green hover:text-brand-green"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {storeForm.regions.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1.5">Aucune région sélectionnée — les commandes sans correspondance iront à la boutique par défaut.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 text-sm">{editingStore ? "Mettre à jour" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal gérant */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold">Nouveau gérant</h2>
              <button onClick={() => setShowUserModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prénom</label>
                  <input value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                    placeholder="Fatou" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nom</label>
                  <input value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                    placeholder="Diallo" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="gerant@boutique.com" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <input required type={showPwd ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Min. 8 caractères" className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Boutique assignée *</label>
                <select required value={userForm.store_id} onChange={(e) => setUserForm({ ...userForm, store_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30">
                  <option value="">Choisir une boutique</option>
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 text-sm">Créer le gérant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
