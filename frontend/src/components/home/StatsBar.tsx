"use client";

import { motion } from "framer-motion";
import { Leaf, Award, MapPin, Truck } from "lucide-react";

const stats = [
  { icon: Leaf, label: "100% Naturel", sublabel: "Sans additifs" },
  { icon: Award, label: "Qualité Premium", sublabel: "Produits sélectionnés" },
  { icon: MapPin, label: "Fait au Sénégal", sublabel: "Savoir-faire local" },
  { icon: Truck, label: "Livraison rapide", sublabel: "Sénégal & international" },
];

export default function StatsBar() {
  return (
    <section className="py-8 bg-white dark:bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, sublabel }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{sublabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
