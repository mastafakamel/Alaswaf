const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

// =========================
// Helpers
// =========================
function httpError(statusCode, message, details) {
  const e = new Error(message);
  e.statusCode = statusCode;
  if (details) e.details = details;
  return e;
}

// =========================
// Enums
// ✅ Dynamic: Use cityId (cuid)
// DepartureCity enum is gone.

// =========================
// Schemas
// =========================
const idParamsSchema = z.object({ id: z.string().trim().min(1) });
const branchIdParamsSchema = z.object({ branchId: z.string().trim().min(1) });
const branchPhoneParamsSchema = z.object({
  branchId: z.string().trim().min(1),
  phoneId: z.string().trim().min(1),
});

const branchCreateSchema = z.object({
  cityId: z.string().trim().min(2),
  label: z.string().trim().min(2).max(100),
  address: z.string().optional().default(""),
  mapUrl: z.string().optional().default(""),
  websiteUrl: z.string().optional().default(""),
  whatsappE164: z.string().trim().min(8).max(20),
  isActive: z.boolean().optional().default(true),
});

const branchUpdateSchema = z.object({
  cityId: z.string().trim().min(2).optional(),
  label: z.string().trim().min(1).max(100).optional(),
  whatsappE164: z.string().trim().min(8).max(30).optional(),
  address: z.string().optional(),
  mapUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

const phoneCreateSchema = z.object({
  label: z.string().trim().max(50).optional().default(""),
  phone: z.string().trim().min(6).max(30),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const phoneUpdateSchema = z.object({
  label: z.string().trim().max(50).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

const phonesReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        sortOrder: z.coerce.number().int().min(0),
      })
    )
    .min(1)
    .optional(),
  ids: z.array(z.string().trim().min(1)).min(1).optional(),
}).refine(data => data.items || data.ids, "Either items or ids must be provided");

// =========================
// Selectors
// =========================
const branchSelectWithPhones = {
  id: true,
  label: true,
  cityId: true,
  city: { select: { id: true, name: true } },
  address: true,
  mapUrl: true,
  whatsappE164: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  phones: {
    select: { id: true, label: true, phone: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
};

const branchSelectSimple = {
  id: true,
  label: true,
  whatsappE164: true,
  address: true,
  mapUrl: true,
  isActive: true,
};

// =========================
// Branches CRUD
// =========================

exports.list = async (req, res) => {
  const items = await prisma.branch.findMany({
    select: branchSelectWithPhones,
    orderBy: { label: "asc" },
  });

  res.json({ items });
};

exports.getOne = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const item = await prisma.branch.findUnique({
    where: { id: params.id },
    select: branchSelectWithPhones,
  });

  if (!item) throw httpError(404, "Branch not found");
  res.json(item);
};

exports.create = async (req, res) => {
  const body = validate(branchCreateSchema, req.body);

  const item = await prisma.branch.create({
    data: {
      cityId: body.cityId,
      label: body.label,
      whatsappE164: body.whatsappE164,
      address: body.address,
      mapUrl: body.mapUrl,
      isActive: body.isActive,
    },
    select: branchSelectWithPhones,
  });

  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(branchUpdateSchema, req.body);

  const exists = await prisma.branch.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) throw httpError(404, "Branch not found");

  const item = await prisma.branch.update({
    where: { id: params.id },
    data: {
      ...(body.cityId !== undefined ? { cityId: body.cityId } : {}),
      ...(body.label !== undefined ? { label: body.label } : {}),
      ...(body.whatsappE164 !== undefined ? { whatsappE164: body.whatsappE164 } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.mapUrl !== undefined ? { mapUrl: body.mapUrl } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
    select: branchSelectWithPhones,
  });

  res.json(item);
};

exports.remove = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const exists = await prisma.branch.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) throw httpError(404, "Branch not found");

  try {
    await prisma.branch.delete({ where: { id: params.id } });
    res.json({ message: "Branch deleted" });
  } catch (err) {
    // غالباً فشل بسبب علاقات phones (FK)
    throw httpError(400, "Cannot delete branch (has phones?)");
  }
};

// =========================
// Phones CRUD (nested)
// =========================

exports.addPhone = async (req, res) => {
  const params = validate(branchIdParamsSchema, req.params);
  const body = validate(phoneCreateSchema, req.body);

  const branch = await prisma.branch.findUnique({ where: { id: params.branchId }, select: { id: true } });
  if (!branch) throw httpError(404, "Branch not found");

  const phone = await prisma.branchPhone.create({
    data: {
      branchId: params.branchId,
      label: body.label,
      phone: body.phone,
      sortOrder: body.sortOrder ?? 0,
    },
    select: { id: true, label: true, phone: true, sortOrder: true },
  });

  res.status(201).json(phone);
};

exports.updatePhone = async (req, res) => {
  const params = validate(branchPhoneParamsSchema, req.params);
  const body = validate(phoneUpdateSchema, req.body);

  const exists = await prisma.branchPhone.findUnique({
    where: { id: params.phoneId },
    select: { id: true, branchId: true },
  });

  if (!exists || exists.branchId !== params.branchId) throw httpError(404, "Phone not found");

  const updated = await prisma.branchPhone.update({
    where: { id: params.phoneId },
    data: {
      ...(body.label !== undefined ? { label: body.label } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
    select: { id: true, label: true, phone: true, sortOrder: true },
  });

  res.json(updated);
};

exports.removePhone = async (req, res) => {
  const params = validate(branchPhoneParamsSchema, req.params);

  const exists = await prisma.branchPhone.findUnique({
    where: { id: params.phoneId },
    select: { id: true, branchId: true },
  });

  if (!exists || exists.branchId !== params.branchId) throw httpError(404, "Phone not found");

  await prisma.branchPhone.delete({ where: { id: params.phoneId } });
  res.json({ message: "Phone deleted" });
};

exports.reorderPhones = async (req, res) => {
  const params = validate(branchIdParamsSchema, req.params);
  const body = validate(phonesReorderSchema, req.body);

  let itemsToUpdate = [];
  if (body.items) {
    itemsToUpdate = body.items;
  } else if (body.ids) {
    itemsToUpdate = body.ids.map((id, index) => ({
      id,
      sortOrder: index * 10,
    }));
  }

  const phoneIds = itemsToUpdate.map((x) => x.id);

  const found = await prisma.branchPhone.findMany({
    where: { id: { in: phoneIds } },
    select: { id: true, branchId: true },
  });

  if (found.length !== phoneIds.length || found.some((x) => x.branchId !== params.branchId)) {
    throw httpError(400, "Invalid phone ids for this branch");
  }

  await prisma.$transaction(
    itemsToUpdate.map((it) =>
      prisma.branchPhone.update({
        where: { id: it.id },
        data: { sortOrder: it.sortOrder },
      })
    )
  );

  const phones = await prisma.branchPhone.findMany({
    where: { branchId: params.branchId },
    select: { id: true, label: true, phone: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  res.json({ message: "OK", phones });
};
