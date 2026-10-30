const BASE_URL = "http://localhost:3000/api";

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/product`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);

  const data = await res.json();
  if (!Array.isArray(data.products)) {
    throw new Error("Invalid products response");
  }
  return data.products;
};