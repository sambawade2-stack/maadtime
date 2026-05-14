"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { productsApi } from "@/lib/api";
import { WishlistItem } from "@/types";
import ProductCard from "@/components/boutique/ProductCard";
import { useRouter } from "next/navigation";

export default function FavorisPage() {
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/connexion"); return; }
    productsApi.wishlist().then((r) => {
      setItems(r.data.results || r.data);
      setLoading(false);
    });
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold mb-6">Mes favoris</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground mb-4">Aucun favori pour le moment.</p>
            <Link href="/boutique" className="btn-primary text-sm">Découvrir nos produits</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
