const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
});

function signAdminToken(admin) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      type: "admin",
      id: admin.id,           // ✅ مهم: نخليه موجود في payload
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn,
    }
  );
}

exports.login = async (req, res) => {
  const body = validate(loginSchema, req.body);
  const email = body.email.toLowerCase(); // ✅ normalize
  const password = body.password;

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // ✅ ما نفضحش هل الايميل موجود ولا لا
  if (!admin || !admin.isActive) {
    const e = new Error("Invalid credentials");
    e.statusCode = 401;
    throw e;
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.statusCode = 401;
    throw e;
  }

  const token = signAdminToken(admin);

  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  });
};

exports.me = async (req, res) => {
  // ✅ لو middleware مش حط admin
  if (!req.admin?.id) {
    const e = new Error("Unauthorized");
    e.statusCode = 401;
    throw e;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin || !admin.isActive) {
    const e = new Error("Unauthorized");
    e.statusCode = 401;
    throw e;
  }

  res.json({ admin });
};
