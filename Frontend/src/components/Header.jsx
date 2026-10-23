import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Leaf } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export default function Header() {
  const { cartCount } = useCart();
  
  const linkStyle = ({ isActive }) =>
    `relative font-medium transition hover:text-sage ${
      isActive ? "text-sage" : "text-white/80"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-leaf to-sage flex items-center justify-center">
            <Leaf size={20} className="text-ink" />
          </span>
          <span className="font-display text-2xl font-bold text-white">
            Verde<span className="text-sage">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" className={linkStyle}>Home</NavLink>
          <NavLink to="/cart" className={linkStyle}>Cart</NavLink>
        </nav>

        <Link
          to="/cart"
          className="relative p-2.5 rounded-full bg-white/10 text-white hover:bg-leaf transition"
        >
          <ShoppingBag size={22} />
          {cartCount > 0 && (
  <motion.span
    key={cartCount}
    initial={{ scale: 1.8 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 12 }}
    className="absolute -top-1 -right-1 bg-sage text-ink text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
  >
    {cartCount}
  </motion.span>
)}
        </Link>
      </div>
    </header>
  );
}