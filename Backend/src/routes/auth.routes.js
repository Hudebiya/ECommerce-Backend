import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { registerUser, loginUser, getCurrentUser, logoutUser, cookieOptions } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
// /api/auth/register
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  prompt: "select_account"
}));
router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${clientUrl}/login?error=google`
}), (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, cookieOptions);
    res.redirect(clientUrl);
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logoutUser);

export default router;