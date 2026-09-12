import { connectDatabase } from "../config/db.js";
import { logger } from "../utils/logger.js";

export async function attachDatabase(req, res, next) {
  try {
    await connectDatabase();
    req.dbError = null;
  } catch (error) {
    req.dbError = error;
    logger.error("database unavailable", { message: error.message });
  }
  next();
}

export function requireDatabase(req, res, next) {
  if (req.dbError) {
    return res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The database is not reachable right now. Try again shortly.",
      },
    });
  }
  return next();
}
