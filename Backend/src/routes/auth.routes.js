import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { registerUser, loginUser, getCurrentUser, logoutUser, cookieOptions } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
// /api/auth/register
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  prompt: "select_account"
}));
router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`
}), (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, cookieOptions);
    res.redirect(process.env.CLIENT_URL);
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logoutUser);

export default router;