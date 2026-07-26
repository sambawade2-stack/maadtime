"use client";

import { useEffect, useState } from "react";
import {
  Search, Plus, X, Trash2, Phone, PhoneCall, Loader2,
  Package, MapPin, FileText, Eye, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Order, OrderItem, Product } from "@/types";
import { dashboardApi, ordersApi } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor, REGIONS_SENEGAL } from "@/lib/utils";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "cancelled", label: "Annulée" },
];

interface CartLine { product: Product; quantity: number; }

const EMPTY_CLIENT = {
  full_name: "", phone: "", city: "", address_line: "", neighborhood: "", notes: "",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // --- Panneau de détail commande ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- Modal nouvelle commande ---
  const [modalOpen, setModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [client, setClient] = useState(EMPTY_CLIENT);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await dashboardApi.allOrders(params);
      setOrders(data.results || data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, search]);
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [filterStatus, search]);

  // Recherche produits dans le modal
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await dashboardApi.products({ search: productSearch, page_size: 8 });
      setProductResults(data.results || data);
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  const openDetail = async (order: Order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const { data } = await ordersApi.detail(order.id);
      setSelectedOrder(data);
    } catch {
      toast.error("Impossible de charger le détail");
    } finally {
      setDetailLoading(false);
    }
  };

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const exists = prev.find((l) => l.product.id === p.id);
      if (exists) return prev.map((l) => l.product.id === p.id ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, { product: p, quantity: 1 }];
    });
    setProductSearch("");
    setProductResults([]);
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((l) => l.product.id !== id));
    else setCart((prev) => prev.map((l) => l.product.id === id ? { ...l, quantity: qty } : l));
  };

  const cartTotal = cart.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const openModal = () => {
    setCart([]);
    setClient(EMPTY_CLIENT);
    setProductSearch("");
    setProductResults([]);
    setModalOpen(true);
  };

  const submitOrder = async () => {
    if (cart.length === 0) { toast.error("Ajoutez au moins un produit"); return; }
    if (!client.full_name || !client.phone || !client.city || !client.address_line) {
      toast.error("Remplissez les informations du client (nom, téléphone, région, adresse)");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...client,
        items: cart.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      };
      await dashboardApi.createAdminOrder(payload);
      toast.success("Commande créée ✓");
      setModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      const d = err.response?.data;
      const msg = typeof d === "object" ? Object.values(d).flat().join(" · ") : "Erreur lors de la création";
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await dashboardApi.updateOrderStatus(id, newStatus);
      toast.success("Statut mis à jour");
      fetchOrders();
      // Mettre à jour le panneau ouvert si c'est la même commande
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as any } : prev);
      }
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="p-6 flex gap-6">
      {/* ── Colonne principale ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedOrder ? "lg:mr-[420px]" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Commandes</h1>
          <button onClick={openModal} className="btn-primary text-sm gap-2">
            <PhoneCall className="w-4 h-4" />
            Commande téléphonique
          </button>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Numéro, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === s.value ? "bg-brand-green text-white" : "bg-muted text-muted-foreground hover:bg-brand-beige"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#Commande", "Client", "Région", "Articles", "Total", "Statut", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50 animate-pulse">
                      <td colSpan={8} className="px-4 py-3"><div className="h-8 bg-muted rounded" /></td>
                    </tr>
                  ))
                ) : orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => openDetail(o)}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                      selectedOrder?.id === o.id ? "bg-brand-green/5 border-l-2 border-l-brand-green" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono font-bold text-brand-green text-xs">#{o.order_number}</p>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.full_name}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.city}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Package className="w-3 h-3" />
                        {o.items_count ?? o.items?.length ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(o.status)}`}>
                        {o.status_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                      >
                        {STATUS_OPTIONS.filter(s => s.value).map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">Aucune commande</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Panneau de détail (fixé à droite) ── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-card border-l border-border shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header panneau */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <p className="font-mono font-bold text-brand-green">#{selectedOrder.order_number}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status_display || selectedOrder.status}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Changer le statut */}
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Modifier le statut</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  >
                    {STATUS_OPTIONS.filter(s => s.value).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Articles commandés */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-brand-green" />
                    <h3 className="font-semibold text-sm">
                      Articles ({selectedOrder.items?.length ?? 0})
                    </h3>
                  </div>

                  {selectedOrder.items?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {/* Image produit */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-beige shrink-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                            )}
                          </div>

                          {/* Infos produit */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>

                          {/* Total ligne */}
                          <p className="text-sm font-semibold shrink-0">{formatPrice(item.total)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucun article</p>
                  )}
                </div>

                {/* Récapitulatif des prix */}
                <div className="px-5 py-4 border-b border-border space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Livraison</span>
                    <span>{selectedOrder.delivery_fee > 0 ? formatPrice(selectedOrder.delivery_fee) : "Gratuite"}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="text-brand-green">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Infos client + livraison */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-brand-green" />
                    <h3 className="font-semibold text-sm">Livraison</h3>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{selectedOrder.full_name}</p>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {selectedOrder.phone}
                    </p>
                    <p className="text-muted-foreground">
                      {[selectedOrder.address_line, selectedOrder.neighborhood, selectedOrder.city, selectedOrder.country]
                        .filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-brand-green" />
                      <h3 className="font-semibold text-sm">Notes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Modal commande téléphonique ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white dark:bg-card rounded-t-3xl z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-green/10 rounded-xl flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold leading-tight">Commande téléphonique</h2>
                      <p className="text-xs text-muted-foreground">Saisir pour un client</p>
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 grid lg:grid-cols-2 gap-6">
                  {/* Colonne gauche : produits */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Produits</h3>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                      {productResults.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                          {productResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addToCart(p)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                            >
                              <div className="w-8 h-8 bg-brand-beige rounded-lg overflow-hidden shrink-0">
                                {p.main_image ? <img src={p.main_image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-lg flex items-center justify-center h-full">🌿</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                <p className="text-xs text-brand-green font-semibold">{formatPrice(p.price)}</p>
                              </div>
                              <Plus className="w-4 h-4 text-brand-green shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-2xl">
                        Aucun produit — recherchez ci-dessus
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cart.map((line) => (
                          <div key={line.product.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{line.product.name}</p>
                              <p className="text-xs text-brand-green">{formatPrice(line.product.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(line.product.id, line.quantity - 1)} className="w-6 h-6 rounded-lg bg-white border border-border text-sm font-bold flex items-center justify-center hover:bg-muted">−</button>
                              <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                              <button onClick={() => updateQty(line.product.id, line.quantity + 1)} className="w-6 h-6 rounded-lg bg-white border border-border text-sm font-bold flex items-center justify-center hover:bg-muted">+</button>
                            </div>
                            <p className="text-sm font-semibold w-20 text-right">{formatPrice(line.product.price * line.quantity)}</p>
                            <button onClick={() => updateQty(line.product.id, 0)} className="text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-sm">
                          <span>Total</span>
                          <span className="text-brand-green">{formatPrice(cartTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colonne droite : infos client */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Informations client</h3>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Nom complet *</label>
                      <input
                        value={client.full_name}
                        onChange={(e) => setClient({ ...client, full_name: e.target.value })}
                        placeholder="Prénom Nom"
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Téléphone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          value={client.phone}
                          onChange={(e) => setClient({ ...client, phone: e.target.value })}
                          placeholder="+221 7X XXX XX XX"
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Région *</label>
                      <select
                        value={client.city}
                        onChange={(e) => setClient({ ...client, city: e.target.value })}
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      >
                        <option value="">Choisir une région</option>
                        {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Adresse *</label>
                      <input
                        value={client.address_line}
                        onChange={(e) => setClient({ ...client, address_line: e.target.value })}
                        placeholder="Rue, quartier, numéro..."
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Ville</label>
                      <input
                        value={client.neighborhood}
                        onChange={(e) => setClient({ ...client, neighborhood: e.target.value })}
                        placeholder="Ville (optionnel)"
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                      <textarea
                        value={client.notes}
                        onChange={(e) => setClient({ ...client, notes: e.target.value })}
                        rows={3}
                        placeholder="Instructions, précisions..."
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-white dark:bg-card rounded-b-3xl">
                  <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={submitting}
                    className="btn-primary text-sm py-2.5"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Créer la commande"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
