import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { cart, increaseQty, decreaseQty, removeFromCart, clearCart, cartTotal } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="inline-flex w-24 h-24 rounded-full bg-sage/20 text-leaf items-center justify-center">
          <ShoppingBag size={44} />
        </span>
        <h2 className="font-display text-3xl font-bold mt-6">Your cart is empty</h2>
        <p className="text-ink/60 mt-2">Looks like you have not added anything yet.</p>
        <Link
          to="/"
          className="inline-block mt-8 bg-deep text-white px-8 py-3 rounded-full hover:bg-leaf transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const shipping = cartTotal > 50 ? 0 : 5;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-ink/60 hover:text-red-600 transition"
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* items */}
               {/* items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -120 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 bg-white rounded-3xl p-4 border border-sage/30"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-24 h-24 object-contain bg-mist rounded-2xl p-2"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.id}`}
                    className="font-semibold line-clamp-1 hover:text-leaf transition"
                  >
                    {item.title}
                  </Link>
                  <p className="text-deep font-bold mt-1">${item.price}</p>

                  <div className="inline-flex items-center gap-3 mt-3 bg-mist rounded-full px-2 py-1">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-sage transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-sage transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">${(item.price * item.qty).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-3 text-ink/40 hover:text-red-600 transition"
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* summary */}
        <div className="h-fit bg-ink text-white rounded-3xl p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-2xl font-bold mb-5">Order Summary</h3>

          <div className="space-y-3 text-sm text-white/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold mt-5 pt-5 border-t border-white/15">
            <span>Total</span>
            <span className="text-sage">${(cartTotal + shipping).toFixed(2)}</span>
          </div>

          <Link
  to="/checkout"
  className="block text-center w-full mt-6 bg-sage text-ink font-semibold py-3.5 rounded-full hover:bg-white transition"
>
  Checkout
</Link>
        </div>
      </div>
    </div>
  );
}