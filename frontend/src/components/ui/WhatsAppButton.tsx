"use client";

import { MessageCircle } from "lucide-react";
import { useStoreConfig, waLink } from "@/hooks/useStoreConfig";

export function WhatsAppButton({ label = "WhatsApp", className = "" }: { label?: string; className?: string }) {
  const config = useStoreConfig();
  return (
    <a
      href={waLink(config.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-400 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </a>
  );
}
