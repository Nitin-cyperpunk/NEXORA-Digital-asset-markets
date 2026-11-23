export function formatPrice(value: number, currency = "USDT") {
  if (!Number.isFinite(value) || value < 0) return "—";
  const digits = value >= 1000 ? 2 : value >= 1 ? 2 : 6;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: digits }).format(value);
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatVolume(value: number) {
  if (!Number.isFinite(value) || value < 0) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function parseFinite(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
