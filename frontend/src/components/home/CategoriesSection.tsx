"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";
import { productsApi } from "@/lib/api";

const categoryEmojis: Record<string, string> = {
  "maad-naturel": "🌰",
  "huile-de-maad": "🫙",
  "poudre-de-maad": "🌿",
  "savons-naturels": "🧼",
  cosmetiques: "✨",
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productsApi.categories().then((r) => setCategories(r.data.results || r.data));
  }, []);

  return (
    <section className="py-20 bg-brand-beige dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-green font-medium text-sm mb-2">Nos gammes</p>
            <h2 className="section-title">Catégories</h2>
          </div>
          <Link
            href="/boutique"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-green font-medium hover:gap-2 transition-all"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(categories.length > 0 ? categories : mockCategories).map((cat, i) => (
            <motion.div
              key={cat.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/boutique?category=${cat.slug}`}
                className="group flex flex-col items-center bg-white dark:bg-card rounded-2xl p-6 shadow-card hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-20 h-20 bg-brand-beige dark:bg-muted rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-green/10 transition-colors overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{categoryEmojis[cat.slug] || "🌿"}</span>
                  )}
                </div>
                <p className="font-semibold text-sm group-hover:text-brand-green transition-colors">
                  {cat.name}
                </p>
                {cat.product_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{cat.product_count} produits</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const mockCategories: Category[] = [
  { id: 1, name: "Maad", slug: "maad-naturel", description: "", image: null, is_active: true, order: 0, product_count: 0 },
  { id: 2, name: "Huile de Maad", slug: "huile-de-maad", description: "", image: null, is_active: true, order: 1, product_count: 0 },
  { id: 3, name: "Savons", slug: "savons-naturels", description: "", image: null, is_active: true, order: 2, product_count: 0 },
  { id: 4, name: "Poudres", slug: "poudre-de-maad", description: "", image: null, is_active: true, order: 3, product_count: 0 },
  { id: 5, name: "Cosmétiques", slug: "cosmetiques", description: "", image: null, is_active: true, order: 4, product_count: 0 },
];
