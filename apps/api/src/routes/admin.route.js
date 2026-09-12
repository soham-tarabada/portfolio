import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireDatabase } from "../middleware/database.js";
import { uploadPdf } from "../middleware/upload.js";
import {
  listResources,
  listResource,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  reorder,
} from "../controllers/admin.controller.js";
import {
  listResumeVersions,
  uploadResume,
  activateResume,
  deleteResume,
} from "../controllers/asset.controller.js";
import {
  listInbox,
  inboxCounts,
  readMessage,
  updateMessage,
  removeMessage,
} from "../controllers/inbox.controller.js";
import {
  analyticsSummary,
  forgetAnalyticsSession,
} from "../controllers/analytics.controller.js";
import { listQuestions, deleteQuestion } from "../controllers/ask.controller.js";
import {
  selectionSchema,
  tailorSource,
  listVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  previewVariant,
  renderVariant,
  publishVariant,
} from "../controllers/tailor.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use("/admin", requireDatabase, authenticate);

router.get("/admin/resources", listResources);

router.get("/admin/assets/resume", listResumeVersions);
router.post("/admin/assets/resume", uploadPdf, uploadResume);
router.post("/admin/assets/resume/:id/activate", activateResume);
router.delete("/admin/assets/resume/:id", deleteResume);

router.get("/admin/inbox", listInbox);
router.get("/admin/inbox/counts", inboxCounts);
router.get("/admin/inbox/:id", readMessage);
router.patch("/admin/inbox/:id", updateMessage);
router.delete("/admin/inbox/:id", removeMessage);

router.get("/admin/analytics", analyticsSummary);
router.delete("/admin/analytics/sessions/:session", forgetAnalyticsSession);

router.get("/admin/ask", listQuestions);
router.delete("/admin/ask/:id", deleteQuestion);

router.get("/admin/tailor/source", tailorSource);
router.get("/admin/tailor", listVariants);
router.post("/admin/tailor", validate(selectionSchema), createVariant);
router.post("/admin/tailor/preview", validate(selectionSchema), previewVariant);
router.post("/admin/tailor/render", validate(selectionSchema), renderVariant);
router.post("/admin/tailor/publish", validate(selectionSchema), publishVariant);
router.post("/admin/tailor/:id/publish", validate(selectionSchema), publishVariant);
router.put("/admin/tailor/:id", validate(selectionSchema), updateVariant);
router.delete("/admin/tailor/:id", deleteVariant);

router.patch("/admin/:resource/reorder", reorder);

router.get("/admin/:resource", listResource);
router.post("/admin/:resource", createOne);
router.put("/admin/:resource", updateOne);
router.patch("/admin/:resource", updateOne);

router.get("/admin/:resource/:id", getOne);
router.put("/admin/:resource/:id", updateOne);
router.patch("/admin/:resource/:id", updateOne);
router.delete("/admin/:resource/:id", deleteOne);

export default router;
