import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-SN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + " FCFA";
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-SN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const CITIES_SENEGAL = [
  "Dakar", "Thiès", "Diourbel", "Touba", "Louga", "Mbour",
  "Kaolack", "Ziguinchor", "Saint-Louis", "Tambacounda", "Kolda",
  "Fatick", "Kaffrine", "Matam", "Sédhiou", "Kédougou",
  "Rufisque", "Pikine", "Guédiawaye", "Bargny",
];
