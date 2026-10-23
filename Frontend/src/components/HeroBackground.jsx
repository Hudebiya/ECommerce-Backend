import { useEffect, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1567958451986-2de427a4a0be",
  "https://images.unsplash.com/photo-1676313753526-4268df8ddda1",
  "https://images.unsplash.com/photo-1758520387873-eb3a83a5f665",
  "https://images.unsplash.com/photo-1758520387434-3ade1dbb4cf7",
];

const optimize = (url) =>
  url.includes("images.unsplash.com")
    ? `${url}?w=1920&q=75&auto=format&fit=crop`
    : url;

export default function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % IMAGES.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* images: fade + slow zoom */}
      {IMAGES.map((src, i) => {
        const active = i === index;
        return (
          <img
            key={src}
            src={optimize(src)}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "scale(1.12)" : "scale(1)",
              transition: `opacity 1500ms ease, transform ${
                active ? "8000ms ease-out" : "0ms linear 1600ms"
              }`,
            }}
          />
        );
      })}

      
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-deep/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

      {/* dots */}
      <div className="absolute bottom-24 right-6 md:right-12 flex gap-2 z-10">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Image ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-sage" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}