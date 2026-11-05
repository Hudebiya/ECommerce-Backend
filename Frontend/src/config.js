const envUrl = import.meta.env.VITE_API_URL;

export const API_URL = envUrl
  ? envUrl
  : import.meta.env.DEV
    ? "http://localhost:3000"
    : "";