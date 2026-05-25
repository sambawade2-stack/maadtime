"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { isOpen, getNextOpeningInfo } from "@/lib/businessHours";

export default function ClosedBanner() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(isOpen());
    const id = setInterval(() => setOpen(isOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (open) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-3 text-sm">
      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
      <span className="text-amber-800 font-medium">
        Nous sommes actuellement fermés — Réouverture {getNextOpeningInfo()}.
        Vous pouvez quand même passer commande, nous la traiterons à la réouverture.
      </span>
    </div>
  );
}
