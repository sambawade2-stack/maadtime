"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Phone, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Category } from "@/types";
import { productsApi } from "@/lib/api";

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productsApi.categories().then((r) => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-foreground dark:bg-card text-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-background">Maadtime</p>
                <p className="text-xs text-background/60">100% Naturel</p>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Le goût naturel du maad sénégalais. Des produits locaux, naturels et de qualité
              pour votre bien-être.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/221773043453"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Instagram className="w-4 h-4 text-background" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Facebook className="w-4 h-4 text-background" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-background mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/boutique", label: "Boutique" },
                { href: "/boutique?is_new=true", label: "Nouveautés" },
                { href: "/boutique?is_featured=true", label: "Produits populaires" },
                { href: "/suivi", label: "Suivi de commande" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-semibold text-background mb-4">Catégories</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/boutique?category=${cat.slug}`}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-sm text-background/40">—</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4 text-brand-green-light shrink-0" />
                <a href="tel:+221773043453" className="hover:text-background transition-colors">
                  +221 77 304 34 53
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 text-brand-green-light shrink-0" />
                Sénégal
              </li>
            </ul>
            <a
              href="https://wa.me/221773043453?text=Bonjour%20Maadtime%2C%20je%20veux%20commander"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Maadtime. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-background/50">
            <span>Produits 100% naturels</span>
            <span>•</span>
            <span>Fait au Sénégal</span>
            <span>•</span>
            <span>Livraison rapide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
