import { Router } from "express";
import healthRoutes from "./health.route.js";
import contentRoutes from "./content.route.js";
import authRoutes from "./auth.route.js";
import resumeRoutes from "./resume.route.js";
import contactRoutes from "./contact.route.js";
import eventRoutes from "./events.route.js";
import spotifyRoutes from "./spotify.route.js";
import askRoutes from "./ask.route.js";
import adminRoutes from "./admin.route.js";

const router = Router();

router.use(healthRoutes);
router.use(contentRoutes);
router.use(authRoutes);
router.use(resumeRoutes);
router.use(contactRoutes);
router.use(eventRoutes);
router.use(spotifyRoutes);
router.use(askRoutes);
router.use(adminRoutes);

export default router;
