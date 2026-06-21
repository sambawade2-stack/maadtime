"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { productsApi } from "@/lib/api";
import ProductCard from "@/components/boutique/ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.featured().then((r) => {
      setProducts(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-green font-medium text-sm mb-2">Les plus vendus</p>
            <h2 className="section-title">Produits populaires</h2>
          </div>
          <Link
            href="/boutique"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-green font-medium hover:gap-2 transition-all"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted-foreground/10" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted-foreground/10 rounded" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                  <div className="h-5 bg-muted-foreground/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Les produits arrivent bientôt...
          </p>
        )}
      </div>
    </section>
  );
}
