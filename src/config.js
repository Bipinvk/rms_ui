function normalize(url = "") {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_BASE_URL; // <== ONLY ONE ENV USED

  if (!url) {
    throw new Error("VITE_API_BASE_URL is not defined in .env");
  }

  return normalize(url);
}

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
