function normalize(url = "") {
  return url.replace(/\/+$/, "");
}

const DEFAULT_PROD_BASE = "https://api.prod.com"; 
const DEFAULT_DEV_BASE = "http://localhost:5000/api";

export function getApiBaseUrl() {
  // Vite-style env access
  const envUrl =
    import.meta.env.REACT_APP_API_BASE_URL ||
    import.meta.env.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL;

  if (envUrl) return normalize(envUrl);

  const isProd = import.meta.env.PROD;

  return normalize(isProd ? DEFAULT_PROD_BASE : DEFAULT_DEV_BASE);
}

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
