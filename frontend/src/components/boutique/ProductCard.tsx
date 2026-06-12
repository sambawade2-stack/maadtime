"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} ajouté au panier`, {
      icon: "🛒",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Retiré des favoris" : "Ajouté aux favoris", {
      icon: isWishlisted ? "💔" : "❤️",
    });
  };

  return (
    <div>
      <Link href={`/produits/${product.slug}`} className="card-product block group">
        <div className="relative overflow-hidden aspect-square bg-brand-beige">
          {product.is_new && <span className="badge-new">Nouveau</span>}
          {product.discount_percent && (
            <span className="badge-promo">-{product.discount_percent}%</span>
          )}

          {product.main_image ? (
            <Image
              src={product.main_image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌿</span>
              </div>
            </div>
          )}

          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-full">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={handleWishlist}
              className="w-10 h-10 bg-white rounded-xl shadow-premium flex items-center justify-center hover:bg-brand-beige transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`}
              />
            </button>
            {product.in_stock && (
              <button
                onClick={handleAddToCart}
                className="flex-1 max-w-[110px] sm:max-w-[140px] bg-brand-green text-white rounded-xl shadow-premium flex items-center justify-center gap-2 text-xs font-semibold py-2 hover:bg-brand-green-dark transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Ajouter
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {product.category_name && (
            <p className="text-xs text-muted-foreground mb-1">{product.category_name}</p>
          )}
          <h3 className="font-medium text-sm text-foreground truncate group-hover:text-brand-green transition-colors">
            {product.name}
          </h3>
          {product.weight && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.weight}</p>
          )}

          {product.average_rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-brand-brown text-brand-brown" />
              <span className="text-xs text-muted-foreground">{product.average_rating}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-bold text-brand-green">{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span className="text-xs text-muted-foreground line-through ml-2">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
            {product.in_stock && (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
