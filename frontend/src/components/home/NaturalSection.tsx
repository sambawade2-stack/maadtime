"use client";

import { motion } from "framer-motion";
import { Leaf, Droplets, FlaskConical, Heart } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "100% Naturel",
    description: "Nos produits sont entièrement naturels, sans colorants ni conservateurs artificiels.",
  },
  {
    icon: Droplets,
    title: "Riche en nutriments",
    description: "Le maad sénégalais est riche en vitamines C, antioxydants et minéraux essentiels.",
  },
  {
    icon: FlaskConical,
    title: "Qualité contrôlée",
    description: "Chaque produit est soigneusement sélectionné et testé avant d'être commercialisé.",
  },
  {
    icon: Heart,
    title: "Bien-être garanti",
    description: "Formulés pour votre santé et votre beauté, nos produits respectent votre corps.",
  },
];

export default function NaturalSection() {
  return (
    <section className="py-20 bg-brand-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/70 font-medium text-sm mb-3">Pourquoi Maadtime ?</p>
            <h2 className="font-display text-4xl font-bold text-white mb-6">
              La puissance du maad sénégalais
            </h2>
            <p className="text-white/80 leading-relaxed mb-8">
              Le maad (Saba senegalensis) est un fruit sauvage du Sénégal, utilisé depuis des
              siècles pour ses vertus nutritionnelles et thérapeutiques. Chez Maadtime, nous
              valorisons ce trésor local en proposant des produits de haute qualité.
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-display text-4xl font-bold">100%</p>
                <p className="text-white/70 text-sm">Naturel</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="font-display text-4xl font-bold">+5</p>
                <p className="text-white/70 text-sm">Produits</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="font-display text-4xl font-bold">🇸🇳</p>
                <p className="text-white/70 text-sm">Sénégal</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-colors"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
