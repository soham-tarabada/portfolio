import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireDatabase } from "../middleware/database.js";
import {
  login,
  refresh,
  logout,
  publicUser,
  refreshCookieOptions,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
} from "../services/auth.service.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many sign-in attempts. Try again in 15 minutes.",
    },
  },
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("must be a valid email address"),
  password: z.string().min(8, "must be at least 8 characters"),
});

router.post(
  "/auth/login",
  loginLimiter,
  requireDatabase,
  validate(loginSchema),
  async (req, res) => {
    const result = await login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.get("user-agent"),
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    res.json({
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: result.user,
    });
  }
);

router.post("/auth/refresh", requireDatabase, async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

  const result = await refresh({ token, userAgent: req.get("user-agent") });

  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
  res.json({
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
    user: result.user,
  });
});

router.post("/auth/logout", requireDatabase, async (req, res) => {
  await logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  res.status(204).end();
});

router.get("/auth/me", requireDatabase, authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
