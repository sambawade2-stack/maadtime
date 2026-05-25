"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, subtotal, deliveryFee, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-card flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-40" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-6">Découvrez nos produits naturels !</p>
          <Link href="/boutique" className="btn-primary">
            Voir la boutique <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold mb-8">
          Mon panier ({items.reduce((a, i) => a + i.quantity, 0)} articles)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-card rounded-2xl p-4 shadow-card flex gap-4 items-center"
              >
                <div className="w-20 h-20 bg-brand-beige rounded-xl overflow-hidden shrink-0">
                  {item.product.main_image && (
                    <Image
                      src={item.product.main_image}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produits/${item.product.slug}`}
                    className="font-semibold hover:text-brand-green transition-colors truncate block"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.weight && (
                    <p className="text-xs text-muted-foreground">{item.product.weight}</p>
                  )}
                  <p className="text-brand-green font-bold mt-1">{formatPrice(item.product.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:border-brand-green transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:border-brand-green transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="mt-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-card rounded-2xl shadow-card p-6 sticky top-16 lg:top-24">
              <h2 className="font-semibold mb-5">Résumé</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-bold text-base pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-brand-green">{formatPrice(subtotal())}</span>
                </div>
                <p className="text-xs text-muted-foreground">Frais de livraison calculés à part</p>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center mt-6">
                Commander <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/221773043453?text=Bonjour%2C%20je%20veux%20commander%20${encodeURIComponent(items.map(i => `${i.product.name} x${i.quantity}`).join(", "))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-green-600 font-medium mt-3 hover:underline"
              >
                Commander via WhatsApp
              </a>

              <Link
                href="/boutique"
                className="block text-center text-sm text-muted-foreground mt-3 hover:text-brand-green"
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
