const jwt = require("jsonwebtoken");

function getTokenFromReq(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

exports.requireAdminAuth = (req, res, next) => {
  const token = getTokenFromReq(req);
  if (!token) {
    const e = new Error("Missing token");
    e.statusCode = 401;
    throw e;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ تأكيد إنه توكن أدمن
    if (payload.type !== "admin") {
      const e = new Error("Invalid token type");
      e.statusCode = 401;
      throw e;
    }

    // ✅ مرن: يقبل id من payload.id أو payload.sub
    const adminId = payload.id || payload.sub;
    if (!adminId) {
      const e = new Error("Invalid token payload");
      e.statusCode = 401;
      throw e;
    }

    req.admin = {
      id: adminId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    err.statusCode = 401;
    err.message = "Invalid or expired token";
    throw err;
  }
};
