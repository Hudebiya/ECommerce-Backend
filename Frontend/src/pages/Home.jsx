import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Search, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import HeroBackground from "../components/HeroBackground";

// hero animation ke variants (component se bahar)
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("Products load nahi ho sakay. Dobara try karein."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisible(12);
  }, [search, category, sort]);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filtered = products
    .filter((p) => category === "all" || p.category === category)
    .filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("default");
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 w-full">
          <motion.div
            className="max-w-2xl"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.span
              variants={item}
              className="inline-block bg-white/10 text-sage text-sm px-4 py-1.5 rounded-full border border-white/10 backdrop-blur"
            >
              New Season Collection
            </motion.span>

            <motion.h1
              variants={item}
              className="font-display text-5xl md:text-7xl font-bold text-white mt-6 leading-tight"
            >
              Shop with <span className="text-sage italic">style</span>,<br />
              live with ease.
            </motion.h1>

            <motion.p variants={item} className="text-white/75 mt-6 max-w-md text-lg">
              Discover handpicked products at prices you will love. Fast delivery, easy returns.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4 mt-10">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-sage text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-white transition"
              >
                Shop Now <ArrowRight size={18} />
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-3.5 rounded-full hover:bg-white/10 transition"
              >
                Explore
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-deep/10 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sage/30">
          {[
            { icon: Truck, title: "Free Delivery", text: "On orders over $50" },
            { icon: ShieldCheck, title: "Secure Payment", text: "100% protected" },
            { icon: RotateCcw, title: "Easy Returns", text: "7 days return policy" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 p-6">
              <span className="w-12 h-12 rounded-2xl bg-mist text-leaf flex items-center justify-center">
                <Icon size={24} />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-ink/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-4 pt-20 scroll-mt-20">
        <div className="text-center mb-10">
          <p className="text-leaf font-medium tracking-widest text-sm uppercase">Our Collection</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Featured Products</h2>
        </div>

                {/* search + sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-sage/40 rounded-full pl-11 pr-10 py-3 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* sort */}
          <div className="relative md:w-64">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-white border border-sage/40 rounded-full pl-6 pr-12 py-3 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20 cursor-pointer transition"
            >
              <option value="default">Sort: Default</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-ink/50 pointer-events-none"
            />
          </div>
        </div>

        {/* category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 capitalize text-sm px-5 py-2 rounded-full border transition ${
                category === c
                  ? "bg-deep text-white border-deep"
                  : "bg-white text-ink/70 border-sage/40 hover:border-leaf hover:text-leaf"
              }`}
            >
              {c.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        {error && <p className="text-center text-red-600 mb-6">{error}</p>}

        {!loading && !error && (
          <p className="text-sm text-ink/60 mb-4">{filtered.length} products</p>
        )}

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : filtered.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* khali result */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-2xl font-bold">No Product Found</p>
            <p className="text-ink/60 mt-2">Try Again.</p>
            <button
              onClick={clearFilters}
              className="mt-6 bg-deep text-white px-8 py-3 rounded-full hover:bg-leaf transition"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* load more */}
        {!loading && visible < filtered.length && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisible((v) => v + 12)}
              className="border-2 border-deep text-deep font-semibold px-10 py-3 rounded-full hover:bg-deep hover:text-white transition"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </div>
  );
}