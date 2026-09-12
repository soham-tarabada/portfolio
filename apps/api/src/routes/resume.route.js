import { Router } from "express";
import { requireDatabase } from "../middleware/database.js";
import { downloadResume, resumeMeta } from "../controllers/asset.controller.js";

const router = Router();

router.get("/resume", requireDatabase, downloadResume);
router.get("/resume/meta", requireDatabase, resumeMeta);

export default router;
