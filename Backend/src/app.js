import "dotenv/config";
import express  from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import cookieParser from "cookie-parser";
const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const clientUrl =
  process.env.CLIENT_URL ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:5173" : null);
if (!clientUrl) {
  throw new Error("CLIENT_URL must be configured in production.");
}
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart",cartRoutes )

export default app;