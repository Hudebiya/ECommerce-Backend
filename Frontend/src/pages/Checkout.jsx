import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const inputBase =
  "w-full bg-white border rounded-2xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-leaf/20";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    payment: "cod",
  });
  const [errors, setErrors] = useState({});

  const shipping = cartTotal > 50 ? 0 : 5;
  const total = cartTotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // likhte waqt us field ka error hat jaye
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Poora naam likhein (kam az kam 3 huroof).";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Sahi email likhein.";
    if (!/^\+?\d{10,15}$/.test(form.phone.replace(/[\s-]/g, "")))
      e.phone = "Sahi phone number likhein (10 se 15 digits).";
    if (form.address.trim().length < 10) e.address = "Poora address likhein (kam az kam 10 huroof).";
    if (form.city.trim().length < 2) e.city = "City ka naam likhein.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    // pehle success page par bhejein, phir cart khali karein
    navigate("/order-success", {
      state: { orderId, total, name: form.name.trim(), payment: form.payment },
    });
    clearCart();
  };

  const border = (name) =>
    errors[name] ? "border-red-400 focus:border-red-500" : "border-sage/40 focus:border-leaf";

  /* cart khali ho to checkout nahi */
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="inline-flex w-24 h-24 rounded-full bg-sage/20 text-leaf items-center justify-center">
          <ShoppingBag size={44} />
        </span>
        <h2 className="font-display text-3xl font-bold mt-6">Nothing to checkout</h2>
        <p className="text-ink/60 mt-2">Pehle cart mein kuch products add karein.</p>
        <Link
          to="/"
          className="inline-block mt-8 bg-deep text-white px-8 py-3 rounded-full hover:bg-leaf transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-leaf transition mb-6"
      >
        <ArrowLeft size={16} /> Back to cart
      </Link>

      <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-sage/30 p-6">
            <h2 className="font-display text-2xl font-bold mb-5">Delivery Details</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full Name" error={errors.name}>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ayesha Khan"
                  className={`${inputBase} ${border("name")}`}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${inputBase} ${border("email")}`}
                />
              </Field>

              <Field label="Phone" error={errors.phone}>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  className={`${inputBase} ${border("phone")}`}
                />
              </Field>

              <Field label="City" error={errors.city}>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className={`${inputBase} ${border("city")}`}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Address" error={errors.address}>
                <textarea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House no, street, area"
                  className={`${inputBase} ${border("address")} resize-none`}
                />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-sage/30 p-6">
            <h2 className="font-display text-2xl font-bold mb-5">Payment Method</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { value: "cod", label: "Cash on Delivery", text: "Delivery par payment karein", icon: Banknote },
                { value: "card", label: "Card (demo)", text: "Abhi sirf dikhane ke liye", icon: CreditCard },
              ].map(({ value, label, text, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition ${
                    form.payment === value
                      ? "border-leaf bg-mist"
                      : "border-sage/30 hover:border-sage"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={form.payment === value}
                    onChange={handleChange}
                    className="accent-leaf"
                  />
                  <Icon size={22} className="text-leaf" />
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-ink/60">{text}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: summary */}
        <div className="h-fit bg-ink text-white rounded-3xl p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-2xl font-bold mb-5">Your Order</h3>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {cart.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <img
                  src={it.thumbnail}
                  alt={it.title}
                  className="w-14 h-14 object-contain bg-white/10 rounded-xl p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1">{it.title}</p>
                  <p className="text-xs text-white/60">Qty: {it.qty}</p>
                </div>
                <p className="text-sm font-semibold">${(it.price * it.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm text-white/80 mt-6 pt-5 border-t border-white/15">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold mt-5 pt-5 border-t border-white/15">
            <span>Total</span>
            <span className="text-sage">${total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-sage text-ink font-semibold py-3.5 rounded-full hover:bg-white transition"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}