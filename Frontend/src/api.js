const BASE_URL = "http://localhost:5000/api";

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products?limit=100`, { credentials: "include" });
  const data = await res.json();
  return data.products;
};

export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, { credentials: "include" });
  return res.json();
};

export const getProductsByCategory = async (category) => {
  const res = await fetch(`${BASE_URL}/products/category/${category}`, { credentials: "include" });
  const data = await res.json();
  return data.products;
};