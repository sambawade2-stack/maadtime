"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function WhatsAppCTA() {
  return (
    <section className="py-20 bg-white dark:bg-card">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-3xl p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Besoin d&apos;aide pour commander ?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Notre équipe est disponible sur WhatsApp pour vous accompagner dans votre achat
              et répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/221773043453?text=Bonjour%20Maadtime%2C%20je%20voudrais%20passer%20une%20commande"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-semibold px-8 py-4 rounded-xl hover:bg-brand-beige transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Commander via WhatsApp
              </a>
              <a
                href="/boutique"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Voir la boutique
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
