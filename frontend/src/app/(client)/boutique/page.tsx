"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Product, Category, PaginatedResponse } from "@/types";
import { productsApi } from "@/lib/api";
import ProductCard from "@/components/boutique/ProductCard";

function BoutiqueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const inStock = searchParams.get("in_stock") || "";
  const featured = searchParams.get("is_featured") || "";
  const ordering = searchParams.get("ordering") || "-created_at";

  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        ordering,
      };
      if (search) params.search = search;
      if (category) params.category_slug = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (inStock) params.in_stock = inStock;
      if (featured) params.is_featured = featured;

      const { data } = await productsApi.list(params);
      const paginated = data as PaginatedResponse<Product>;
      setProducts(paginated.results || data);
      setTotal(paginated.count || data.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, minPrice, maxPrice, inStock, featured, ordering]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    productsApi.categories().then((r) =>
      setCategories(r.data.results || r.data)
    );
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setPage(1);
    router.push(`/boutique?${params.toString()}`);
  };

  const clearFilters = () => {
    setPage(1);
    router.push("/boutique");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold mb-6">Boutique</h1>

          {/* Search + Filters bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                defaultValue={search}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateFilter("search", (e.target as HTMLInputElement).value);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-sm"
              />
            </div>

            <select
              value={ordering}
              onChange={(e) => updateFilter("ordering", e.target.value)}
              className="px-4 py-2.5 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="-created_at">Nouveautés</option>
              <option value="price">Prix croissant</option>
              <option value="-price">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl border border-border text-sm hover:bg-brand-beige-dark transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {(category || minPrice || maxPrice || inStock || featured) && (
                <span className="w-2 h-2 bg-brand-green rounded-full" />
              )}
            </button>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 bg-brand-beige dark:bg-muted rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {/* Categories */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium mb-1.5">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-border text-sm"
                >
                  <option value="">Toutes</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Prix min (FCFA)</label>
                <input
                  type="number"
                  placeholder="0"
                  defaultValue={minPrice}
                  onBlur={(e) => updateFilter("min_price", e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Prix max (FCFA)</label>
                <input
                  type="number"
                  placeholder="100000"
                  defaultValue={maxPrice}
                  onBlur={(e) => updateFilter("max_price", e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-border text-sm"
                />
              </div>

              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock === "true"}
                    onChange={(e) => updateFilter("in_stock", e.target.checked ? "true" : "")}
                    className="w-4 h-4 accent-brand-green"
                  />
                  <span className="text-sm">En stock</span>
                </label>
              </div>

              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            </motion.div>
          )}

          {/* Category pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => updateFilter("category", "")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? "bg-brand-green text-white"
                  : "bg-white dark:bg-card border border-border hover:border-brand-green"
              }`}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateFilter("category", c.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === c.slug
                    ? "bg-brand-green text-white"
                    : "bg-white dark:bg-card border border-border hover:border-brand-green"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            {total} produit{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-display text-xl font-bold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-brand-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                  page === i + 1
                    ? "bg-brand-green text-white"
                    : "border border-border hover:border-brand-green"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-brand-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BoutiquePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-beige" />}>
      <BoutiqueContent />
    </Suspense>
  );
}
