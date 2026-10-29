import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = ({ isActive }) =>
    `relative font-medium transition hover:text-sage ${
      isActive ? "text-sage" : "text-white/80"
    }`;

  const cartLink = (mobile = false) => (
    <NavLink
      to="/cart"
      onClick={() => setMenuOpen(false)}
      aria-label={`Cart, ${cartCount} items`}
      className={`${linkStyle} inline-flex items-center gap-2`}
    >
      <span className="relative inline-flex">
        <ShoppingBag size={mobile ? 18 : 19} />
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 1.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 12 }}
            className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[10px] font-bold text-ink"
          >
            {cartCount}
          </motion.span>
        )}
      </span>
      <span>Cart</span>
    </NavLink>
  );

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } catch {
      showToast("You were signed out, but the server session could not be cleared.");
    } finally {
      clearCart();
      navigate("/login", { replace: true });
    }
  };

  const username = user?.name || user?.username || user?.email;

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-linear-to-br from-leaf to-sage flex items-center justify-center">
            <Leaf size={20} className="text-ink" />
          </span>
          <span className="font-display text-2xl font-bold text-white">
            Verde<span className="text-sage">.</span>
          </span>
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink to="/" className={linkStyle}>Home</NavLink>
              {cartLink()}
            </nav>

            <div className="hidden items-center gap-5 md:flex">
              <span className="max-w-40 truncate text-sm font-medium text-white/80" title={username}>{username}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-leaf"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <Link
                to="/cart"
                aria-label={`Open cart, ${cartCount} items`}
                className="relative rounded-full bg-white/10 p-2.5 text-white transition hover:bg-leaf"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sage px-1 text-xs font-bold text-ink">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-leaf"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </>
        ) : (
          <NavLink to="/login" className={linkStyle}>Login</NavLink>
        )}
      </div>

      {user && menuOpen && (
        <nav className="absolute left-0 right-0 top-full border-t border-white/10 bg-ink px-4 py-4 shadow-xl md:hidden">
          <p className="mb-3 truncate border-b border-white/10 pb-3 text-sm text-white/60">{username}</p>
          <div className="flex flex-col gap-4">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={linkStyle}>Home</NavLink>
            {cartLink(true)}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-left font-medium text-white/80 transition hover:text-sage"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}