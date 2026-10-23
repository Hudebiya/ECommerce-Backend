import { Link } from "react-router-dom";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-sage/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-leaf/20 blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 py-28 text-center">
        <p className="font-display text-[8rem] md:text-[11rem] font-bold leading-none bg-gradient-to-br from-ink via-deep to-sage bg-clip-text text-transparent">
          404
        </p>

        <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">
          Page Not Found.
        </h1>
        <p className="text-ink/60 mt-4 max-w-md mx-auto">
          Go back to Shopping Page.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-deep text-white px-8 py-3.5 rounded-full hover:bg-leaf transition"
          >
            <Home size={18} /> Go Home
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 border-2 border-deep text-deep px-8 py-3.5 rounded-full hover:bg-deep hover:text-white transition"
          >
            <ShoppingBag size={18} /> View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}