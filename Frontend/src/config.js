const configuredApiUrl = import.meta.env.VITE_API_URL;

if (!configuredApiUrl && !import.meta.env.DEV) {
  throw new Error("VITE_API_URL must be configured in production.");
}

export const API_URL = configuredApiUrl || "http://localhost:3000";
