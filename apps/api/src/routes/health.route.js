import { Router } from "express";
import mongoose from "mongoose";
import { databaseState } from "../config/db.js";
import { env } from "../config/env.js";

const router = Router();

async function pingDatabase() {
  if (mongoose.connection.readyState !== 1) return null;
  const startedAt = process.hrtime.bigint();
  try {
    await mongoose.connection.db.admin().command({ ping: 1 });
    return Number(process.hrtime.bigint() - startedAt) / 1e6;
  } catch {
    return null;
  }
}

router.get("/health", async (req, res) => {
  const database = databaseState();
  const pingMs = await pingDatabase();
  const healthy = database.readyState === 1 && pingMs !== null;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    service: env.SERVICE_NAME,
    version: env.SERVICE_VERSION,
    environment: env.NODE_ENV,
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
    database: {
      status: database.status,
      name: database.name,
      host: database.host,
      pingMs: pingMs === null ? null : Number(pingMs.toFixed(2)),
      error: req.dbError ? req.dbError.message : null,
    },
  });
});

export default router;
