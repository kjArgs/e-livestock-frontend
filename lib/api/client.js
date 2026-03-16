const FALLBACK_API_BASE_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

export function apiUrl(path) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");

  return `${normalizedBase}/${normalizedPath}`;
}
