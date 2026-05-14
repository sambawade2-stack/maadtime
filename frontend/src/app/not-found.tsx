import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-beige flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-brand-green rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-premium">
        <Leaf className="w-10 h-10 text-white" />
      </div>
      <h1 className="font-display text-6xl font-bold text-brand-green mb-4">404</h1>
      <h2 className="font-display text-2xl font-bold mb-2">Page introuvable</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Cette page n&apos;existe pas. Peut-être que vous cherchez nos produits naturels ?
      </p>
      <Link href="/" className="btn-primary">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
