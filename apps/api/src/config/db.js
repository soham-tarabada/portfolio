import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const READY_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
};

if (!globalThis.__portfolioMongoose) {
  globalThis.__portfolioMongoose = { conn: null, promise: null };
}
const cache = globalThis.__portfolioMongoose;

export async function connectDatabase() {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
        minPoolSize: 0,
      })
      .then((instance) => {
        logger.info("mongodb connected", {
          database: instance.connection.name,
          host: instance.connection.host,
        });
        return instance;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export function databaseState() {
  const readyState = mongoose.connection.readyState;
  return {
    status: READY_STATES[readyState] || "unknown",
    readyState,
    name: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}
