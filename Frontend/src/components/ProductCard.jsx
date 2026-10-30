import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
  return (
   <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  whileHover={{ y: -8 }}
  className="group bg-white rounded-3xl overflow-hidden border border-sage/30 hover:shadow-2xl hover:shadow-deep/20 transition-shadow duration-300"
>

      <Link to={`/product/${product._id}`} className="block relative bg-mist aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition duration-500"
        />
      </Link>

      <div className="p-5">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold line-clamp-1 hover:text-leaf transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-deep">${product.price}</span>
          <button
  onClick={() => addToCart(product)}
  className="w-10 h-10 rounded-full bg-deep text-white flex items-center justify-center hover:bg-leaf hover:rotate-90 transition duration-300"
  aria-label="Add to cart"
>
  <Plus size={20} />
</button>
        </div>
      </div>
    </motion.div>
  );
}
