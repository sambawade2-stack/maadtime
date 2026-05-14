"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Star, Truck } from "lucide-react";

const badges = [
  { icon: Leaf, label: "100% Naturel" },
  { icon: ShieldCheck, label: "Qualité Premium" },
  { icon: Star, label: "Fait au Sénégal" },
  { icon: Truck, label: "Livraison Sénégal & international" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-beige dark:bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-green/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            >
              <Leaf className="w-4 h-4" />
              100% naturel — Sénégal
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Le goût naturel{" "}
              <span className="text-brand-green relative">
                du maad
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path
                    d="M0 6C50 2 150 2 200 6"
                    stroke="#6AA84F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              sénégalais
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Des produits locaux, naturels et de qualité pour votre bien-être. Découvrez
              l&apos;authenticité du maad sous toutes ses formes.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/boutique" className="btn-primary">
                Découvrir nos produits
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/boutique?is_featured=true" className="btn-outline">
                Produits populaires
              </Link>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-white dark:bg-card rounded-xl p-3 shadow-card"
                >
                  <Icon className="w-4 h-4 text-brand-green shrink-0" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-brand-brown/20 rounded-full" />

              {/* Inner circle with visual */}
              <div className="absolute inset-8 bg-white dark:bg-card rounded-full shadow-premium-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Maadtime"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 -right-4 bg-white dark:bg-card rounded-2xl shadow-premium p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-brand-brown fill-brand-brown" />
                </div>
                <div>
                  <p className="text-xs font-bold">4.9/5</p>
                  <p className="text-[10px] text-muted-foreground">Satisfaction</p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
