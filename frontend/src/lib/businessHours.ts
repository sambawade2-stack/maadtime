export const BUSINESS_HOURS = [
  { day: 1, open: 8, close: 18 },  // Lundi
  { day: 2, open: 8, close: 18 },  // Mardi
  { day: 3, open: 8, close: 18 },  // Mercredi
  { day: 4, open: 8, close: 18 },  // Jeudi
  { day: 5, open: 8, close: 18 },  // Vendredi
  { day: 6, open: 9, close: 15 },  // Samedi
  // Dimanche (0) = fermé
];

export function isOpen(): boolean {
  const now = new Date();
  // Heure de Dakar (UTC+0, pas de changement d'heure)
  const dakar = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Dakar" }));
  const day = dakar.getDay();
  const hour = dakar.getHours() + dakar.getMinutes() / 60;
  const schedule = BUSINESS_HOURS.find((h) => h.day === day);
  if (!schedule) return false;
  return hour >= schedule.open && hour < schedule.close;
}

export function getNextOpeningInfo(): string {
  const now = new Date();
  const dakar = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Dakar" }));
  const day = dakar.getDay();
  if (day === 0) return "Lundi à 08h00";
  if (day === 6) return "Lundi à 08h00";
  return "demain à 08h00";
}
