import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export function errorHandler(error, req, res, next) {
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "No record with that id." } });
  }

  const status = error.status || error.statusCode || 500;

  if (status >= 500) {
    logger.error("unhandled error", {
      message: error.message,
      stack: error.stack,
      path: req.originalUrl,
    });
  }

  const hideDetail = status === 500 && env.NODE_ENV === "production";

  return res.status(status).json({
    error: {
      code: error.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
      message: hideDetail ? "Something went wrong." : error.message,
    },
  });
}
