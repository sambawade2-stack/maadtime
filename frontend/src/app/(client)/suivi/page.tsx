"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useStoreConfig, waLink } from "@/hooks/useStoreConfig";
import Image from "next/image";
import Link from "next/link";

const STATUS_STEPS = [
  { key: "pending",    label: "En attente",     icon: Clock },
  { key: "confirmed",  label: "Confirmée",      icon: CheckCircle },
  { key: "processing", label: "En traitement",  icon: Package },
  { key: "shipped",    label: "Expédiée",       icon: Truck },
  { key: "delivered",  label: "Livrée",         icon: CheckCircle },
];

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

function getStepIndex(status: string) {
  const i = STATUS_ORDER.indexOf(status);
  return i === -1 ? 0 : i;
}

function SuiviContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get("numero") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const config = useStoreConfig();

  const handleSearch = async (num?: string) => {
    const number = (num ?? input).trim().toUpperCase();
    if (!number) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const { data } = await ordersApi.track(number);
      setOrder(data);
      router.replace(`/suivi?numero=${number}`, { scroll: false });
    } catch (e: any) {
      setError(e.response?.data?.error || "Commande introuvable. Vérifiez le numéro.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const num = searchParams.get("numero");
    if (num) handleSearch(num);
  }, []);

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-green mb-6 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Suivi de commande</h1>
          <p className="text-muted-foreground text-sm">
            Entrez votre numéro de commande pour connaître son état en temps réel.
          </p>
        </div>

        {/* Search box */}
        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex : MT7A3F2B1C"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/30 uppercase tracking-widest"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {loading ? "..." : "Rechercher"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Result */}
        {order && (
          <div className="space-y-4">
            {/* Order header */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Numéro de commande</p>
                  <p className="font-mono font-bold text-xl text-brand-green tracking-wider">
                    #{order.order_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                  <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                <span><span className="text-foreground font-medium">{order.full_name}</span></span>
                <span>·</span>
                <span>{order.city}{order.country !== "Sénégal" ? `, ${order.country}` : ""}</span>
                <span>·</span>
                <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-semibold mb-6 text-sm">Statut de la commande</h2>

              {isCancelled ? (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-4">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Commande annulée</p>
                    <p className="text-xs opacity-80 mt-0.5">Cette commande a été annulée.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-brand-green transition-all duration-700"
                    style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />

                  <div className="space-y-6 relative">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                            done
                              ? "bg-brand-green text-white shadow-md"
                              : "bg-white dark:bg-card border-2 border-border text-muted-foreground"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            {active && (
                              <p className="text-xs text-brand-green font-medium mt-0.5">
                                ← Statut actuel
                              </p>
                            )}
                          </div>
                          {done && <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold mb-4 text-sm">Articles commandés</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-beige rounded-xl overflow-hidden shrink-0">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{formatPrice(item.total)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : "Gratuit"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span className="text-brand-green">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            <p className="text-center text-xs text-muted-foreground pb-4">
              Un problème ?{" "}
              <a
                href={waLink(config.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline font-medium"
              >
                Contactez-nous sur WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-beige" />}>
      <SuiviContent />
    </Suspense>
  );
}
