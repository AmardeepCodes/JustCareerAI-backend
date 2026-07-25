import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Step 1 — Google pe redirect karo
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2 — Google callback
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login?error=oauth_failed" }),
  (req, res) => {
    const token = jwt.sign(
      { sub: req.user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );
    // Frontend pe token ke saath redirect karo
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);

export default router;