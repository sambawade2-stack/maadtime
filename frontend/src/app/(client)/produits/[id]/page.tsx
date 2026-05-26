"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart, Heart, Minus, Plus, Leaf, Truck, Shield, Star,
  ArrowLeft, Share2, ChevronRight
} from "lucide-react";
import { Product } from "@/types";
import { productsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useStoreConfig, waLink } from "@/hooks/useStoreConfig";
import ProductCard from "@/components/boutique/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const config = useStoreConfig();

  useEffect(() => {
    productsApi
      .detail(id)
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
        if (data.category?.id) {
          productsApi
            .similar({ category: data.category.id, exclude: data.id })
            .then((r) => setSimilar(r.data));
        }
      })
      .catch(() => {
        setLoading(false);
        router.push("/boutique");
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} ajouté au panier !`, { icon: "🛒" });
  };

  const images = product.images?.length > 0
    ? product.images
    : product.main_image
    ? [{ id: 0, image: product.main_image, alt_text: product.name, is_main: true, order: 0 }]
    : [];

  return (
    <div className="bg-brand-beige dark:bg-background min-h-screen pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-brand-green transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/boutique" className="hover:text-brand-green transition-colors">Boutique</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[100px] sm:max-w-[180px] md:max-w-[260px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white dark:bg-card rounded-3xl overflow-hidden shadow-premium relative"
            >
              {product.is_new && (
                <span className="absolute top-4 left-4 bg-brand-green text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                  Nouveau
                </span>
              )}
              {product.discount_percent && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                  -{product.discount_percent}%
                </span>
              )}
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]?.image || images[0].image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🌿</span>
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-brand-green" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.image}
                      alt={img.alt_text || product.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/boutique?category=${product.category.slug}`}
                className="text-brand-green text-sm font-medium hover:underline mb-2"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

            {product.average_rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.average_rating!)
                          ? "fill-brand-brown text-brand-brown"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.average_rating} ({product.reviews_count} avis)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-brand-green">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.short_description}
              </p>
            )}

            {/* Stock + Weight */}
            <div className="flex items-center gap-4 mb-6 text-sm">
              {product.weight && (
                <span className="bg-brand-beige dark:bg-muted px-3 py-1.5 rounded-lg font-medium">
                  {product.weight}
                </span>
              )}
              <span
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  product.in_stock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.in_stock
                  ? `En stock (${product.stock} disponible${product.stock > 1 ? "s" : ""})`
                  : "Rupture de stock"}
              </span>
            </div>

            {/* Quantity */}
            {product.in_stock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantité :</span>
                <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions — sticky bar on mobile */}
            <div className="flex gap-3 mb-8">
              {product.in_stock ? (
                <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center">
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>
              ) : (
                <button disabled className="flex-1 btn-primary opacity-50 cursor-not-allowed justify-center">
                  Rupture de stock
                </button>
              )}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-border hover:border-brand-green transition-colors shrink-0"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
              <button
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-border hover:border-brand-green transition-colors shrink-0"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Sticky mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border p-4 flex gap-3">
              {product.in_stock ? (
                <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center py-3.5">
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier — {formatPrice(product.price * quantity)}
                </button>
              ) : (
                <button disabled className="flex-1 btn-primary opacity-50 cursor-not-allowed justify-center py-3.5">
                  Rupture de stock
                </button>
              )}
            </div>

            {/* WhatsApp order */}
            <a
              href={waLink(config.whatsapp, `Bonjour ${config.name}, je veux commander ${product.name} x${quantity}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors mb-8"
            >
              Commander via WhatsApp
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {[
                { icon: Leaf, label: "100% Naturel" },
                { icon: Truck, label: "Livraison rapide" },
                { icon: Shield, label: "Qualité garantie" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="w-6 h-6 text-brand-green mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white dark:bg-card rounded-2xl p-8 mb-12 shadow-card">
            <h2 className="font-display text-2xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Similar products */}
        {similar.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
