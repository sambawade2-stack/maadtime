"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, Search } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import toast from "react-hot-toast";

interface InventoryItem {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  main_image: string | null;
  category_name: string;
  stock: number;
}

export default function AdminStocksPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<number, string>>({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardApi.inventory();
      setInventory(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const updateStock = async (id: number) => {
    const val = editing[id];
    if (val === undefined) return;
    const stock = parseInt(val);
    if (isNaN(stock) || stock < 0) { toast.error("Stock invalide"); return; }
    try {
      await dashboardApi.updateInventory(id, { stock });
      toast.success("Stock mis à jour");
      setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchInventory();
    } catch {
      toast.error("Erreur");
    }
  };

  const filtered = inventory.filter((i) =>
    i.product_name.toLowerCase().includes(search.toLowerCase()) ||
    i.category_name.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock = filtered.filter((i) => i.stock === 0).length;
  const lowStock = filtered.filter((i) => i.stock > 0 && i.stock <= 5).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Stocks</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {outOfStock > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {outOfStock} rupture{outOfStock > 1 ? "s" : ""}
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 rounded-xl px-4 py-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {lowStock} stock faible
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Produit</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Stock actuel</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Modifier</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50 animate-pulse">
                      <td colSpan={4} className="px-4 py-3"><div className="h-10 bg-muted rounded" /></td>
                    </tr>
                  ))
                : filtered.map((item) => {
                    const isEditing = editing[item.id] !== undefined;
                    const stockVal = isEditing ? editing[item.id] : item.stock.toString();
                    return (
                      <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-beige rounded-lg overflow-hidden shrink-0">
                              {item.main_image ? (
                                <img src={item.main_image} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                              )}
                            </div>
                            <span className="font-medium text-sm">{item.product_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-lg text-xs">
                            {item.category_name || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${
                            item.stock === 0 ? "text-red-500" :
                            item.stock <= 5 ? "text-orange-500" : "text-green-600"
                          }`}>
                            {item.stock === 0 && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockVal}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-20 px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                            />
                            {isEditing && (
                              <button
                                onClick={() => updateStock(item.id)}
                                className="px-3 py-1.5 bg-brand-green text-white text-xs font-medium rounded-lg hover:bg-brand-green/90 transition-colors"
                              >
                                Enregistrer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
