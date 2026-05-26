"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, User, FileText, CheckCircle, Truck, Globe, Flag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { ordersApi } from "@/lib/api";
import { formatPrice, REGIONS_SENEGAL } from "@/lib/utils";
import { CheckoutForm } from "@/types";
import toast from "react-hot-toast";
import { useStoreConfig, waLink } from "@/hooks/useStoreConfig";

const schema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  phone: z.string().min(6, "Téléphone invalide").max(20),
  country: z.string().min(1, "Pays requis"),
  address_line: z.string().min(3, "Adresse requise"),
  city: z.string().min(1, "Région requise"),
  neighborhood: z.string().optional(),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const config = useStoreConfig();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Sénégal" },
  });

  if (items.length === 0 && !ordered) {
    router.push("/boutique");
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const { data: order } = await ordersApi.create({ ...data, items: orderItems });
      setOrderNumber(order.order_number);
      clearCart();
      setOrdered(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erreur lors de la commande.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-premium-lg"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Commande confirmée !</h2>
          <p className="text-muted-foreground mb-4">
            Votre commande <span className="font-bold text-brand-green">#{orderNumber}</span> a
            été reçue. Nous vous contacterons sous peu.
          </p>
          <div className="bg-brand-beige rounded-2xl p-4 mb-6 text-left text-sm">
            <p className="font-medium mb-1">Paiement :</p>
            <p className="text-muted-foreground">À la livraison — Aucun paiement immédiat requis.</p>
          </div>
          <a
            href={waLink(config.whatsapp, `Bonjour, j'ai passé la commande #${orderNumber}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center mb-3"
          >
            Confirmer via WhatsApp
          </a>
          <button
            onClick={() => router.push(`/suivi?numero=${orderNumber}`)}
            className="w-full py-3 rounded-xl border border-brand-green text-brand-green text-sm font-medium hover:bg-brand-green/5 transition-colors mb-3"
          >
            Suivre ma commande
          </button>
          <button
            onClick={() => router.push("/boutique")}
            className="w-full text-sm text-muted-foreground hover:text-brand-green transition-colors"
          >
            Continuer les achats
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold mb-8">Finaliser la commande</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order summary — visible en haut sur mobile, à droite sur desktop */}
          <div className="lg:col-span-1 lg:order-last">
            <div className="bg-white dark:bg-card rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-semibold mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-brand-beige rounded-xl overflow-hidden shrink-0">
                      {item.product.main_image && (
                        <Image
                          src={item.product.main_image}
                          alt={item.product.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-green">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand-green">{formatPrice(subtotal())}</span>
                </div>
                <p className="text-xs text-muted-foreground">Frais de livraison payés à la réception</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 lg:order-first">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Delivery info */}
              <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-green" />
                  Informations de livraison
                </h2>

                {/* Toggle Sénégal / International */}
                <div className="flex gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => { setIsInternational(false); setValue("country", "Sénégal"); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      !isInternational ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-border text-muted-foreground hover:border-brand-green/40"
                    }`}
                  >
                    <Flag className="w-4 h-4" /> Sénégal
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsInternational(true); setValue("country", ""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      isInternational ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-border text-muted-foreground hover:border-brand-green/40"
                    }`}
                  >
                    <Globe className="w-4 h-4" /> International
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...register("full_name")}
                        placeholder="Prénom Nom"
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...register("phone")}
                        placeholder={isInternational ? "+33 6 XX XX XX XX" : "+221 7X XXX XX XX"}
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  {/* Pays (international) ou Région dropdown (Sénégal) */}
                  {isInternational ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Pays <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("country")}
                          placeholder="France, USA, Maroc..."
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("city")}
                          placeholder="Paris, New York..."
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Code postal</label>
                        <input
                          {...register("neighborhood")}
                          placeholder="75001"
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Région <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("city")}
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        >
                          <option value="">Choisir une région</option>
                          {REGIONS_SENEGAL.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Quartier</label>
                        <input
                          {...register("neighborhood")}
                          placeholder="Quartier (optionnel)"
                          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                        />
                      </div>
                    </>
                  )}

                  {/* Adresse */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">
                      Adresse complète <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <input
                        {...register("address_line")}
                        placeholder={isInternational ? "Rue, numéro, appartement..." : "Rue, quartier, numéro..."}
                        className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    {errors.address_line && <p className="text-red-500 text-xs mt-1">{errors.address_line.message}</p>}
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">
                      <FileText className="inline w-4 h-4 mr-1" />
                      Notes
                    </label>
                    <input
                      {...register("notes")}
                      placeholder="Instructions de livraison..."
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold mb-3">Paiement</h2>
                <div className="flex items-center gap-3 bg-brand-beige dark:bg-muted rounded-xl p-4">
                  <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg">💵</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Paiement à la livraison</p>
                    <p className="text-xs text-muted-foreground">Payez en espèces à la réception</p>
                  </div>
                  <div className="ml-auto w-5 h-5 bg-brand-green rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmer ma commande
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
