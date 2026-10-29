import { useState } from "react";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useToast } from "../context/ToastContext";

const inputClass = "w-full rounded-xl border border-sage/50 bg-mist px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-leaf focus:ring-2 focus:ring-leaf/20";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = {};

    if (!formData.username.trim()) nextErrors.username = "Username is required.";
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/", { replace: true });
    } catch (error) {
      const message = error.message || "Unable to create your account.";
      setFormError(message);
      showToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-[65vh] items-center px-4 py-12 md:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-deep/10 md:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-between bg-ink p-8 text-white sm:p-10 md:p-12">
          <Link to="/" className="inline-flex w-fit items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-leaf to-sage">
              <Leaf size={21} className="text-ink" />
            </span>
            <span className="font-display text-2xl font-bold">Verde<span className="text-sage">.</span></span>
          </Link>
          <div className="mt-12 md:mt-20">
            <p className="text-sm font-medium uppercase text-sage">Join Verde</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">Make room for good finds.</h1>
            <p className="mt-4 max-w-sm leading-relaxed text-white/70">Create an account and discover handpicked products at prices you will love.</p>
          </div>
          <p className="mt-12 text-sm text-white/50">Carefully picked, delivered with care.</p>
        </div>

        <div className="p-6 sm:p-10 md:p-12">
          <div className="mb-7">
            <h2 className="font-display text-3xl font-bold">Create account</h2>
            <p className="mt-2 text-sm text-ink/60">A few details and you’re all set.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="signup-username" className="mb-2 block text-sm font-medium">Username</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "signup-username-error" : undefined}
                placeholder="Your name"
                className={`${inputClass} ${errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              />
              {errors.username && <p id="signup-username-error" role="alert" className="mt-1.5 text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-medium">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "signup-email-error" : undefined}
                placeholder="you@example.com"
                className={`${inputClass} ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              />
              {errors.email && <p id="signup-email-error" role="alert" className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "signup-password-error" : undefined}
                  placeholder="At least 6 characters"
                  className={`${inputClass} pr-12 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink/55 transition hover:text-leaf focus-visible:outline-2 focus-visible:outline-leaf"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p id="signup-password-error" role="alert" className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-medium">Confirm password</label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? "signup-confirm-password-error" : undefined}
                  placeholder="Re-enter your password"
                  className={`${inputClass} pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink/55 transition hover:text-leaf focus-visible:outline-2 focus-visible:outline-leaf"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p id="signup-confirm-password-error" role="alert" className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-deep px-6 py-3.5 font-semibold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
            {formError && <p role="alert" className="text-center text-sm text-red-600">{formError}</p>}
          </form>

          <p className="mt-6 text-center text-sm text-ink/65">
            Already have an account? <Link to="/login" className="font-semibold text-leaf hover:text-deep">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}