const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

function httpError(statusCode, message, details) {
  const e = new Error(message);
  e.statusCode = statusCode;
  if (details) e.details = details;
  return e;
}

const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

const tagBodySchema = z.object({
  name: z.string().trim().min(1).max(50),
});

const tagSelect = { id: true, name: true, createdAt: true };

// =========================
// Controllers
// =========================

exports.list = async (req, res) => {
  const items = await prisma.tag.findMany({
    select: tagSelect,
    orderBy: { name: "asc" },
  });
  res.json({ items });
};

exports.create = async (req, res) => {
  const body = validate(tagBodySchema, req.body);

  try {
    const tag = await prisma.tag.create({
      data: { name: body.name },
      select: tagSelect,
    });
    res.status(201).json(tag);
  } catch (err) {
    // غالباً unique constraint
    throw httpError(409, "Tag name already exists");
  }
};

exports.update = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(tagBodySchema, req.body);

  const exists = await prisma.tag.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!exists) throw httpError(404, "Tag not found");

  try {
    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: { name: body.name },
      select: tagSelect,
    });
    res.json(tag);
  } catch (err) {
    // غالباً تعارض اسم (unique)
    throw httpError(409, "Tag name already exists");
  }
};

exports.remove = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const exists = await prisma.tag.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!exists) throw httpError(404, "Tag not found");

  try {
    await prisma.tag.delete({ where: { id: params.id } });
    res.json({ message: "Tag deleted" });
  } catch (err) {
    // غالباً مرتبط بعروض (FK)
    throw httpError(400, "Cannot delete tag (in use)");
  }
};
