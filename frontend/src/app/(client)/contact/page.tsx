"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, MessageCircle, Mail, Clock, Send, CheckCircle } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "+221 77 304 34 53",
    href: "tel:+221773043453",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+221 77 304 34 53",
    href: "https://wa.me/221773043453",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@maadtime.sn",
    href: "mailto:contact@maadtime.sn",
  },
  {
    icon: MapPin,
    label: "Localisation",
    value: "Dakar, Sénégal",
    href: null,
  },
];

const hours = [
  { day: "Lundi – Vendredi", time: "08h00 – 18h00" },
  { day: "Samedi", time: "09h00 – 15h00" },
  { day: "Dimanche", time: "Fermé" },
];

const subjects = [
  "Question sur un produit",
  "Suivi de commande",
  "Retour / remboursement",
  "Commande en gros",
  "Partenariat",
  "Autre",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Bonjour Maadtime !\n\n` +
      `Nom : ${form.name}\n` +
      `Email : ${form.email}\n` +
      (form.phone ? `Téléphone : ${form.phone}\n` : "") +
      `Objet : ${form.subject}\n\n` +
      `Message :\n${form.message}`
    );
    window.open(`https://wa.me/221773043453?text=${text}`, "_blank");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-green mb-6 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Contactez-nous</h1>
          <p className="text-muted-foreground">
            Une question, une commande ou une suggestion ? Notre équipe vous répond rapidement.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left — infos */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact cards */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-semibold text-sm mb-2">Nos coordonnées</h2>
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-green/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:text-brand-green transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Horaires */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-brand-green" />
                <h2 className="font-semibold text-sm">Horaires d&apos;ouverture</h2>
              </div>
              <div className="space-y-2">
                {hours.map(({ day, time }) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className={`font-medium ${time === "Fermé" ? "text-red-400" : ""}`}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp direct */}
            <a
              href="https://wa.me/221773043453?text=Bonjour%20Maadtime%2C%20j%27ai%20une%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white py-3.5 rounded-2xl font-medium transition-colors shadow-card"
            >
              <MessageCircle className="w-5 h-5" />
              Chat WhatsApp instantané
            </a>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-card">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Votre message a été transmis via WhatsApp. Nous vous répondrons très rapidement.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="text-sm text-brand-green hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-semibold mb-6">Envoyez-nous un message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Nom complet *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+221 7X XXX XX XX"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Objet *</label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-transparent"
                    >
                      <option value="">Choisissez un objet</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-3.5 rounded-xl font-medium hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer via WhatsApp
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    En cliquant, vous serez redirigé vers WhatsApp avec votre message prêt à envoyer.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
