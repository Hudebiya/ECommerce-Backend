import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function HeroCarousel({ products }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = products.length;

  // auto-play: har 4 second mein agli slide (hover pe ruk jata hai)
  useEffect(() => {
    if (paused || total === 0) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 4000);
    return () => clearInterval(timer);
  }, [paused, total]);

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // products aane tak placeholder
  if (total === 0) {
    return (
      <div className="w-full max-w-md h-[28rem] rounded-[3rem] bg-white/10 border border-white/20 animate-pulse" />
    );
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full max-w-md h-[28rem] rounded-[3rem] overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl shadow-black/40"
    >
      {/* slides */}
      {products.map((p, i) => (
        <div
          key={p.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={p.images?.[0] ?? p.thumbnail}
            alt={p.title}
            draggable={false}
            className={`w-full h-full object-contain p-10 pb-32 transition-transform duration-[4000ms] ease-out ${
              i === index ? "scale-110" : "scale-100"
            }`}
          />

          {/* neeche info */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-ink via-ink/80 to-transparent">
            <span className="text-xs text-sage uppercase tracking-widest">
              {p.category}
            </span>
            <h3 className="font-display text-2xl font-bold text-white line-clamp-1 mt-1">
              {p.title}
            </h3>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-sage">${p.price}</span>
                <span className="flex items-center gap-1 text-sm text-white/70">
                  <Star size={14} className="fill-sage text-sage" /> {p.rating}
                </span>
              </div>
              <Link
                to={`/product/${p.id}`}
                className="bg-sage text-ink text-sm font-semibold px-5 py-2 rounded-full hover:bg-white transition"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/3 w-9 h-9 rounded-full bg-ink/50 text-white flex items-center justify-center hover:bg-leaf transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/3 w-9 h-9 rounded-full bg-ink/50 text-white flex items-center justify-center hover:bg-leaf transition"
      >
        <ChevronRight size={20} />
      </button>

      {/* dots */}
      <div className="absolute top-5 left-0 right-0 flex justify-center gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-sage" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}