const winston = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom format for local development
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }), // capture stack trace
        json()
    ),
    defaultMeta: { service: "alaswaf-backend" },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({
            filename: path.join(__dirname, "../../logs/error.log"),
            level: "error"
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({
            filename: path.join(__dirname, "../../logs/combined.log")
        }),
    ],
});

// If we're not in production then log to the `console` with localized colors
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            ),
        })
    );
}

module.exports = logger;
