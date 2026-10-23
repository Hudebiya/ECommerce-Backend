import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { getProductById, getProductsByCategory } from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImg(0);
    setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    getProductById(id)
      .then((data) => {
        if (!data || data.message) throw new Error("not found");
        setProduct(data);
        return getProductsByCategory(data.category);
      })
      .then((list) => setRelated(list.filter((p) => p.id !== Number(id)).slice(0, 4)))
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

  const images = product.images?.length ? product.images : [product.thumbnail];
  const oldPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  const inStock = product.stock > 0;

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
              src={images[activeImg]}
              alt={product.title}
              className="w-full h-full object-contain p-6 hover:scale-110 transition duration-500"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-20 h-20 rounded-2xl bg-white p-1 border-2 transition ${
                    i === activeImg ? "border-leaf" : "border-sage/30 hover:border-sage"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <span className="inline-block bg-ink text-sage text-xs px-3 py-1 rounded-full capitalize">
            {product.category}
          </span>

          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Star size={16} className="fill-leaf text-leaf" /> {product.rating}
            </span>
            {product.brand && <span className="text-ink/50">by {product.brand}</span>}
          </div>

          <div className="flex items-end gap-3 mt-6">
            <span className="text-4xl font-bold text-deep">${product.price}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-lg text-ink/40 line-through">${oldPrice}</span>
                <span className="bg-sage/30 text-deep text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  -{Math.round(product.discountPercentage)}%
                </span>
              </>
            )}
          </div>

          <p className="text-ink/70 mt-6 leading-relaxed">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${inStock ? "text-leaf" : "text-red-600"}`}>
            {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

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
                onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
                className="w-8 h-8 rounded-full bg-mist flex items-center justify-center hover:bg-sage transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!inStock}
              className={`flex-1 min-w-48 inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${
                added ? "bg-leaf text-white" : "bg-deep text-white hover:bg-leaf"
              }`}
            >
              <ShoppingBag size={18} />
              {added ? "Added to cart!" : "Add to Cart"}
            </button>
          </div>

          {/* PERKS */}
          <div className="grid sm:grid-cols-2 gap-3 mt-8 text-sm">
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-sage/30">
              <Truck size={20} className="text-leaf" />
              {product.shippingInformation || "Fast delivery"}
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-sage/30">
              <ShieldCheck size={20} className="text-leaf" />
              {product.warrantyInformation || "Secure purchase"}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}