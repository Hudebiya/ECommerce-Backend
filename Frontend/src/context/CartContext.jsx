import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { API_URL } from "../config.js";
import { useAuth } from "./auth-context";
import { useToast } from "./ToastContext";

const CartContext = createContext();
const CART_URL = `${API_URL}/api/cart`;

function readGuestCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(storedCart) ? storedCart : [];
  } catch {
    return [];
  }
}

function normalizeCart(items) {
  return items.flatMap(({ product, quantity }) => {
    if (!product?._id) return [];

    return [{
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      qty: quantity,
    }];
  });
}

async function readCartResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Cart request failed.");
  }
  if (!Array.isArray(data.cart)) {
    throw new Error("Invalid cart response.");
  }
  return data;
}

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState(readGuestCart);
  const [loadedAccountKey, setLoadedAccountKey] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const requestPendingRef = useRef(false);
  const syncPromiseRef = useRef(null);
  const accountKey = user
    ? String(user._id ?? user.id ?? user.email ?? "authenticated")
    : null;
  const activeAccountKeyRef = useRef(accountKey);

  useLayoutEffect(() => {
    activeAccountKeyRef.current = accountKey;
  }, [accountKey]);

  const runWhilePending = async (request) => {
    if (requestPendingRef.current) return false;
    requestPendingRef.current = true;
    setIsPending(true);
    try {
      return await request();
    } finally {
      requestPendingRef.current = false;
      setIsPending(false);
    }
  };

  const sendCartRequest = async (path, method, body) => {
    const response = await fetch(`${CART_URL}${path}`, {
      method,
      credentials: "include",
      ...(body && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
    return readCartResponse(response);
  };

  useEffect(() => {
    if (isAuthLoading || user) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading || !user || !accountKey) return;

    if (syncPromiseRef.current?.accountKey === accountKey) return;

    const sync = runWhilePending(async () => {
      try {
        const data = await sendCartRequest("/", "GET");
        if (activeAccountKeyRef.current !== accountKey) return;
        setCart(normalizeCart(data.cart));
        setLoadedAccountKey(accountKey);

        const guestCart = readGuestCart();
        for (let index = 0; index < guestCart.length; index += 1) {
          const item = guestCart[index];
          if (
            !item?._id ||
            !Number.isSafeInteger(item.qty) ||
            item.qty < 1
          ) {
            continue;
          }

          const merged = await sendCartRequest("/items", "POST", {
            productId: item._id,
            quantity: item.qty,
          });
          if (activeAccountKeyRef.current !== accountKey) return;
          setCart(normalizeCart(merged.cart));

          guestCart.splice(index, 1);
          index -= 1;
          localStorage.setItem("cart", JSON.stringify(guestCart));
        }

        localStorage.setItem("cart", "[]");
      } catch (error) {
        if (activeAccountKeyRef.current === accountKey) {
          showToast(error.message || "Unable to load your cart.", "error");
        }
      }
    });

    syncPromiseRef.current = { accountKey, promise: sync };
    sync.finally(() => {
      if (syncPromiseRef.current?.accountKey === accountKey) {
        syncPromiseRef.current = null;
      }
    });
  }, [accountKey, isAuthLoading, user, showToast]);

  const addToCart = async (product, qty = 1) => {
    if (!Number.isSafeInteger(qty) || qty < 1) {
      showToast("Quantity must be a positive integer.", "error");
      return false;
    }

    const existing = cart.find((item) => item._id === product._id);
    if (
      Number.isFinite(product.stock) &&
      (existing?.qty || 0) + qty > product.stock
    ) {
      showToast("Requested quantity exceeds available stock.", "error");
      return false;
    }

    if (user) {
      return runWhilePending(async () => {
        try {
          const data = await sendCartRequest("/items", "POST", {
            productId: product._id,
            quantity: qty,
          });
          if (activeAccountKeyRef.current !== accountKey) return false;
          setCart(normalizeCart(data.cart));
          showToast(`${product.name} added to cart`);
          return true;
        } catch (error) {
          showToast(error.message || "Unable to add product to cart.", "error");
          return false;
        }
      });
    }

    setCart((previous) => {
      const currentItem = previous.find((item) => item._id === product._id);
      if (currentItem) {
        return previous.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + qty, stock: product.stock }
            : item
        );
      }
      return [
        ...previous,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          qty,
        },
      ];
    });
    showToast(`${product.name} added to cart`);
    return true;
  };

  const changeQuantity = async (_id, quantity) => {
    const item = cart.find((entry) => entry._id === _id);
    if (!item || quantity < 1) return false;
    if (Number.isFinite(item.stock) && quantity > item.stock) {
      showToast("Requested quantity exceeds available stock.", "error");
      return false;
    }

    if (user) {
      return runWhilePending(async () => {
        try {
          const data = await sendCartRequest(
            `/items/${encodeURIComponent(_id)}`,
            "PATCH",
            { quantity }
          );
          if (activeAccountKeyRef.current !== accountKey) return false;
          setCart(normalizeCart(data.cart));
          return true;
        } catch (error) {
          showToast(error.message || "Unable to update cart quantity.", "error");
          return false;
        }
      });
    }

    setCart((previous) =>
      previous.map((entry) =>
        entry._id === _id ? { ...entry, qty: quantity } : entry
      )
    );
    return true;
  };

  const increaseQty = (_id) => {
    const item = cart.find((entry) => entry._id === _id);
    return item ? changeQuantity(_id, item.qty + 1) : false;
  };

  const decreaseQty = (_id) => {
    const item = cart.find((entry) => entry._id === _id);
    return item && item.qty > 1 ? changeQuantity(_id, item.qty - 1) : false;
  };

  const removeFromCart = async (_id) => {
    if (!user) {
      setCart((previous) => previous.filter((item) => item._id !== _id));
      return true;
    }

    return runWhilePending(async () => {
      try {
        const data = await sendCartRequest(
          `/items/${encodeURIComponent(_id)}`,
          "DELETE"
        );
        if (activeAccountKeyRef.current !== accountKey) return false;
        setCart(normalizeCart(data.cart));
        return true;
      } catch (error) {
        showToast(error.message || "Unable to remove product from cart.", "error");
        return false;
      }
    });
  };

  const clearCart = () => setCart([]);

  const visibleCart = user && loadedAccountKey !== accountKey ? [] : cart;
  const cartCount = visibleCart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = visibleCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart: visibleCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isBusy: isPending || isAuthLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
