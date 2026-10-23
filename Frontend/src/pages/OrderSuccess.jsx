import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function OrderSuccess() {
  const { state } = useLocation();

  // seedha link khol dene par (bina order ke)
  if (!state) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-ink/60 mb-6">Koi order nahi mila.</p>
        <Link to="/" className="bg-deep text-white px-8 py-3 rounded-full hover:bg-leaf transition">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="inline-flex w-24 h-24 rounded-full bg-leaf text-white items-center justify-center shadow-xl shadow-leaf/30"
      >
        <Check size={48} strokeWidth={3} />
      </motion.span>

      <h1 className="font-display text-4xl md:text-5xl font-bold mt-8">
        Order Placed!
      </h1>
      <p className="text-ink/70 mt-4">
        Shukriya <span className="font-semibold">{state.name}</span>, aap ka order qubool ho gaya hai.
      </p>

      <div className="bg-white rounded-3xl border border-sage/30 p-6 mt-8 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Order ID</span>
          <span className="font-semibold">{state.orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Payment</span>
          <span className="font-semibold">
            {state.payment === "cod" ? "Cash on Delivery" : "Card (demo)"}
          </span>
        </div>
        <div className="flex justify-between pt-3 border-t border-sage/30">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-deep text-lg">${state.total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        to="/"
        className="inline-block mt-10 bg-deep text-white px-10 py-3.5 rounded-full hover:bg-leaf transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}