import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { showToast } = useToast();

  // refresh pe cart na ude, isliye localStorage se shuru karte hain
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty,
        },
      ];
    });

    showToast(`${product.name} added to cart`);
  };

  const increaseQty = (_id) =>
    setCart((prev) =>
      prev.map((item) => (item._id === _id ? { ...item, qty: item.qty + 1 } : item))
    );

  const decreaseQty = (_id) =>
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );

  const removeFromCart = (_id) =>
    setCart((prev) => prev.filter((item) => item._id !== _id));

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}