import app from "./app.js";
import { env, assertEnv } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./utils/logger.js";

assertEnv();

connectDatabase().catch((error) => {
  logger.error("initial database connection failed", { message: error.message });
});

app.listen(env.PORT, () => {
  logger.info(`api listening on http://localhost:${env.PORT}`, {
    environment: env.NODE_ENV,
    allowedOrigins: env.CORS_ORIGINS,
  });
});
