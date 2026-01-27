const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 20,                 // 20 محاولة لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { message: "Too many login attempts. Try again later." } },
});
