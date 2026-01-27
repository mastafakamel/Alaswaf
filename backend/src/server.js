const config = require("./config/env.config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
const path = require("path");

const { prisma } = require("./db/prisma");
const { errorHandler } = require("./middleware/error.middleware");
const { loginLimiter } = require("./middleware/rateLimit");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");



// Routes
const publicRoutes = require("./routes/public.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();
const PORT = config.PORT;

/* =========================
    Middlewares
========================= */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "*"],
    },
  },
})); // Security headers
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev")); // Logging

// Request ID for tracing
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID?.() || Date.now().toString();
  res.setHeader("X-Request-Id", req.id);

  // Log request start
  logger.info(`${req.method} ${req.url}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  next();
});

app.use(express.json({ limit: "2mb" }));

// ✅ Serve Static Uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS (Production-safe)
const allowedOrigins = config.CORS_ORIGINS
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools (PowerShell/Postman) with no origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true); // fallback لو مش محدد
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS_NOT_ALLOWED"), false);
    },
    credentials: true,
  })
);

/* =========================
   Health endpoint
========================= */
/**
 * @openapi
 * /health:
 *   get:
 *     description: Check if the API and Database are alive
 *     responses:
 *       200:
 *         description: Returns JSON with status "up"
 */
app.get("/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: "up", db: "ok", time: new Date().toISOString() });
  } catch (e) {
    logger.error("Health check failed", { error: e.message, stack: e.stack });
    res.status(503).json({ ok: false, status: "down", db: "fail", time: new Date().toISOString() });
  }
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/* =========================
    Routes
========================= */
const API_PREFIX = "/api/v1";

// Public API
app.use(`${API_PREFIX}`, publicRoutes);

// Admin API
// ✅ Rate limit ONLY on login
app.use(`${API_PREFIX}/admin`, (req, res, next) => {
  if (req.method === "POST" && req.path === "/login") return loginLimiter(req, res, next);
  return next();
});
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/admin`, uploadRoutes);

/* =========================
   Global Error Handler (MUST be last)
========================= */
app.use(errorHandler);

logger.info(`allowedOrigins: ${allowedOrigins.join(", ")}`);


/* =========================
   Start Server
========================= */
const server = app.listen(PORT, () => {
  logger.info(`🚀 Backend running on http://localhost:${PORT} [${config.NODE_ENV}]`);
  logger.info(`📡 API Version: ${API_PREFIX}`);
});

// Process Handlers
process.on("unhandledRejection", (reason, promise) => {
  logger.error("☠️ Unhandled Rejection", { promise, reason });
});

process.on("uncaughtException", (err) => {
  logger.error("☠️ Uncaught Exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

// Export for testing
module.exports = app;
