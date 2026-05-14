"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Product } from "@/types";
import { dashboardApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminStocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await dashboardApi.products({ ordering: "stock", page_size: 100 });
    setProducts(data.results || data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStock = async (slug: string, stock: number) => {
    try {
      await dashboardApi.updateProduct(slug, { stock });
      toast.success("Stock mis à jour");
      fetch();
    } catch {
      toast.error("Erreur");
    }
  };

  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display text-2xl font-bold">Gestion des stocks</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700">{outOfStock.length}</p>
            <p className="text-xs text-red-600">Rupture de stock</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-orange-500 shrink-0" />
          <div>
            <p className="font-bold text-orange-700">{lowStock.length}</p>
            <p className="text-xs text-orange-600">Stock faible (≤5)</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <Package className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-700">
              {products.filter((p) => p.stock > 5).length}
            </p>
            <p className="text-xs text-green-600">En stock normal</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Produit", "Catégorie", "Stock actuel", "Statut", "Modifier stock"].map((h) => (
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
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-8 bg-muted rounded" />
                    </td>
                  </tr>
                ))
              ) : products.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    p.stock === 0 ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category_name}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${
                      p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-orange-600" : "text-green-600"
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.stock === 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Rupture
                      </span>
                    ) : p.stock <= 5 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Faible
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={p.stock}
                        min={0}
                        className="w-20 px-2 py-1 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== p.stock) updateStock(p.slug, val);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
