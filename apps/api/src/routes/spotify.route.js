import { Router } from "express";
import { getNowPlaying } from "../services/spotify.service.js";

const router = Router();

router.get("/now-playing", async (req, res) => {
  const payload = await getNowPlaying();
  res.set("Cache-Control", "public, max-age=0, s-maxage=15, stale-while-revalidate=60");
  res.json(payload);
});

export default router;
