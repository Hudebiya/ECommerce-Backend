import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    getProducts()
      .then((products) => {
        const foundProduct = products.find((item) => item._id === id);
        if (!foundProduct) throw new Error("Product not found");
        setProduct(foundProduct);
        setRelated(products.filter((item) => item._id !== foundProduct._id).slice(0, 4));
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  /* LOADING */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-sage/20 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 bg-sage/30 rounded w-1/4" />
          <div className="h-10 bg-sage/30 rounded w-3/4" />
          <div className="h-4 bg-sage/20 rounded w-1/3" />
          <div className="h-8 bg-sage/30 rounded w-1/4" />
          <div className="h-24 bg-sage/20 rounded" />
          <div className="h-12 bg-sage/30 rounded-full w-2/3" />
        </div>
      </div>
    );
  }

  /* ERROR */
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-red-600 mb-6">{error || "Product nahi mila."}</p>
        <Link to="/" className="bg-deep text-white px-8 py-3 rounded-full hover:bg-leaf transition">
         Go back to Home Page
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-leaf transition mb-6"
      >
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* GALLERY */}
        <div>
          <div className="bg-white rounded-3xl border border-sage/30 aspect-square overflow-hidden flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-6 hover:scale-110 transition duration-500"
            />
          </div>
        </div>

        {/* INFO */}
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-end gap-3 mt-6">
            <span className="text-4xl font-bold text-deep">${product.price}</span>
          </div>

          <p className="text-ink/70 mt-6 leading-relaxed">{product.desc}</p>

          {/* QUANTITY + ADD */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="inline-flex items-center gap-4 bg-white border border-sage/40 rounded-full px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-mist flex items-center justify-center hover:bg-sage transition"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-mist flex items-center justify-center hover:bg-sage transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`flex-1 min-w-48 inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-8 rounded-full transition ${
                added ? "bg-leaf text-white" : "bg-deep text-white hover:bg-leaf"
              }`}
            >
              <ShoppingBag size={18} />
              {added ? "Added to cart!" : "Add to Cart"}
            </button>
          </div>

        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}