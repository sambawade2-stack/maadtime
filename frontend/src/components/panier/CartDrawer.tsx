"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, deliveryFee, total } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-card z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-green" />
                <h2 className="font-display text-xl font-bold">Mon panier</h2>
                {items.length > 0 && (
                  <span className="bg-brand-green text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {items.reduce((a, i) => a + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg font-semibold">Panier vide</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des produits pour commencer votre commande.
                  </p>
                  <Link
                    href="/boutique"
                    onClick={closeCart}
                    className="btn-primary text-sm"
                  >
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 px-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 bg-muted/30 rounded-2xl p-3"
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
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.weight}</p>
                        <p className="text-brand-green font-semibold text-sm mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center hover:border-brand-green transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center hover:border-brand-green transition-colors"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-brand-green">{formatPrice(subtotal())}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full justify-center text-sm"
                >
                  Commander maintenant
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/panier"
                  onClick={closeCart}
                  className="block text-center text-sm text-muted-foreground hover:text-brand-green transition-colors"
                >
                  Voir le panier complet
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
