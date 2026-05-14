"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Fatou Diallo",
    city: "Dakar",
    rating: 5,
    comment:
      "L'huile de maad est exceptionnelle ! Ma peau est beaucoup plus hydratée et lumineuse depuis que je l'utilise. Je recommande vivement !",
    avatar: "F",
  },
  {
    name: "Moussa Sow",
    city: "Thiès",
    rating: 5,
    comment:
      "J'ai commandé le maad naturel et la livraison était super rapide. Le produit est frais et de très bonne qualité. Bravo Maadtime !",
    avatar: "M",
  },
  {
    name: "Aïssatou Ndiaye",
    city: "Mbour",
    rating: 5,
    comment:
      "Le savon au maad est merveilleux. Il sent bon et ma peau est douce comme jamais. Je suis une cliente fidèle depuis 6 mois !",
    avatar: "A",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-brand-beige dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-green font-medium text-sm mb-2">Ils nous font confiance</p>
          <h2 className="section-title">Avis de nos clients</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white dark:bg-card rounded-2xl p-6 shadow-card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-green/10" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-brand-brown text-brand-brown" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
