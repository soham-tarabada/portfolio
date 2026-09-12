import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const humanFormat = combine(
  colorize({ level: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf((info) => {
    const { level, message, timestamp: time, stack, ...meta } = info;
    const extras = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${time} ${level} ${stack || message}${extras}`;
  })
);

const machineFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: env.NODE_ENV === "production" ? machineFormat : humanFormat,
  transports: [new winston.transports.Console()],
});
