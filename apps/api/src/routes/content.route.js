import { Router } from "express";
import { getContent } from "../services/content.service.js";
import { requireDatabase } from "../middleware/database.js";

const router = Router();

router.get("/content", requireDatabase, async (req, res) => {
  const content = await getContent();
  res.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
  res.json(content);
});

export default router;
