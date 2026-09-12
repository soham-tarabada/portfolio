import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { attachDatabase } from "./middleware/database.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { forbidden } from "./utils/httpError.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);

      const matchesWildcard = env.CORS_ORIGINS.some(
        (allowed) => allowed.startsWith("*.") && origin.endsWith(allowed.slice(1))
      );
      if (matchesWildcard) return callback(null, true);

      return callback(forbidden(`Origin ${origin} is not allowed.`, "CORS_FORBIDDEN"));
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.debug("request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

app.use(attachDatabase);

app.get("/", (req, res) => {
  res.json({
    service: env.SERVICE_NAME,
    version: env.SERVICE_VERSION,
    health: "/api/v1/health",
  });
});

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
