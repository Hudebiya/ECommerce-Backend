import { Link } from "react-router-dom";
import { Leaf } from "lucide-react"; 

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-leaf to-sage flex items-center justify-center">
              <Leaf size={20} className="text-ink" />
            </span>
            <span className="font-display text-2xl font-bold text-white">
              Verde<span className="text-sage">.</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Carefully picked products, delivered with care. Shop what you love.
          </p>
        </div>

        <div>
  <h4 className="text-white font-semibold mb-3">Quick Links</h4>
  <ul className="space-y-2 text-sm">
    <li>
      <Link
        to="/"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="hover:text-sage transition"
      >
        Home
      </Link>
    </li>
    <li>
      <Link
        to="/cart"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="hover:text-sage transition"
      >
        Cart
      </Link>
    </li>
    <li>
      <a
        href="mailto:hello@verde.com"
        className="hover:text-sage transition"
      >
        Contact
      </a>
    </li>
  </ul>
</div>

        <div>
          <h4 className="text-white font-semibold mb-3">Newsletter</h4>
          <div className="flex rounded-full bg-white/10 p-1">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-white/40"
            />
            <button className="bg-leaf hover:bg-sage hover:text-ink text-white text-sm font-medium px-5 py-2 rounded-full transition">
              Join
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs py-5 border-t border-white/10">
        © 2026 Verde. All rights reserved.
      </p>
    </footer>
  );
}