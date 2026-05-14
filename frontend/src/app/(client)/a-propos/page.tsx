import { Metadata } from "next";
import Link from "next/link";
import { Leaf, Droplets, FlaskConical, Heart, Users, Award, Globe, ArrowRight, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos — Maadtime",
  description: "Découvrez l'histoire de Maadtime, notre mission et nos valeurs autour du maad sénégalais.",
};

const values = [
  {
    icon: Leaf,
    title: "100% Naturel",
    description: "Pas de colorants, pas de conservateurs artificiels. Uniquement ce que la nature sénégalaise offre.",
  },
  {
    icon: Droplets,
    title: "Riche en bienfaits",
    description: "Le maad est riche en vitamine C, antioxydants et minéraux. Un fruit exceptionnel aux vertus prouvées.",
  },
  {
    icon: FlaskConical,
    title: "Qualité contrôlée",
    description: "Chaque lot est soigneusement sélectionné et vérifié avant de rejoindre notre catalogue.",
  },
  {
    icon: Heart,
    title: "Bien-être avant tout",
    description: "Nous croyons que prendre soin de soi commence par choisir des produits sains et naturels.",
  },
];

const stats = [
  { value: "100%", label: "Naturel", icon: Leaf },
  { value: "+500", label: "Clients satisfaits", icon: Users },
  { value: "5★", label: "Note moyenne", icon: Award },
  { value: "🇸🇳", label: "Made in Sénégal", icon: Globe },
];

const steps = [
  { num: "01", title: "Sélection des fruits", desc: "Nous sélectionnons les meilleurs maads dans les régions productrices du Sénégal." },
  { num: "02", title: "Transformation artisanale", desc: "Nos produits sont préparés selon des méthodes traditionnelles préservant tous les nutriments." },
  { num: "03", title: "Contrôle qualité", desc: "Chaque produit est inspecté avant conditionnement pour garantir la meilleure qualité." },
  { num: "04", title: "Livraison chez vous", desc: "Nous livrons partout au Sénégal et à l'international dans les meilleurs délais." },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-green text-white py-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            Notre histoire
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Valoriser le trésor naturel <br className="hidden md:block" />
            du Sénégal
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            Maadtime est né d&apos;une conviction simple : le maad sénégalais mérite d&apos;être connu
            et consommé dans toute sa pureté. Nous transformons ce fruit extraordinaire en produits
            sains, savoureux et accessibles.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-card rounded-2xl p-6 shadow-card text-center">
              <p className="font-display text-3xl font-bold text-brand-green mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-green font-medium text-sm mb-3">Notre mission</p>
            <h2 className="font-display text-3xl font-bold mb-6">
              Mettre le maad à la portée de tous
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Le maad (Saba senegalensis) est un fruit sauvage utilisé depuis des siècles au Sénégal
              pour ses propriétés nutritionnelles et médicinales. Pourtant, il reste méconnu au-delà
              de nos frontières.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Chez Maadtime, nous nous engageons à valoriser ce patrimoine naturel en proposant
              des produits de qualité irréprochable, fabriqués localement, qui respectent à la fois
              les consommateurs et l&apos;environnement.
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-green/90 transition-colors"
            >
              Découvrir nos produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white dark:bg-card rounded-2xl p-5 shadow-card">
                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="bg-white dark:bg-card py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-green font-medium text-sm mb-3">Du fruit à votre table</p>
            <h2 className="font-display text-3xl font-bold">Notre processus</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-brand-green text-sm">{step.num}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Une question ? On est là.</h2>
        <p className="text-muted-foreground mb-8">
          Notre équipe est disponible pour répondre à toutes vos questions sur nos produits.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-green/90 transition-colors"
          >
            Nous contacter
          </Link>
          <a
            href="https://wa.me/221773043453"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
