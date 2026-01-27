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

const typeSchema = z.enum(["includes", "excludes", "highlights", "whatToBring"]);

function modelByType(type) {
  switch (type) {
    case "includes":
      return prisma.offerInclude;
    case "excludes":
      return prisma.offerExclude;
    case "highlights":
      return prisma.offerHighlight;
    case "whatToBring":
      return prisma.offerWhatToBring;
    default:
      return null;
  }
}

function requireModel(type) {
  const model = modelByType(type);
  if (!model) throw httpError(400, "Invalid type");
  return model;
}

const itemSelect = { id: true, text: true, sortOrder: true };

// =========================
// Schemas
// =========================
const addParamsSchema = z.object({
  offerId: z.string().trim().min(1),
  type: typeSchema,
});

const itemParamsSchema = z.object({
  offerId: z.string().trim().min(1),
  type: typeSchema,
  itemId: z.string().trim().min(1),
});

const addBodySchema = z.object({
  text: z.string().trim().min(1).max(300),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const updateBodySchema = z.object({
  text: z.string().trim().min(1).max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

const reorderBodySchema = z.object({
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
// Controllers
// =========================

exports.add = async (req, res) => {
  const params = validate(addParamsSchema, req.params);
  const body = validate(addBodySchema, req.body);

  const offer = await prisma.offer.findUnique({ where: { id: params.offerId }, select: { id: true } });
  if (!offer) throw httpError(404, "Offer not found");

  const model = requireModel(params.type);

  const item = await model.create({
    data: { offerId: params.offerId, text: body.text, sortOrder: body.sortOrder ?? 0 },
    select: itemSelect,
  });

  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const params = validate(itemParamsSchema, req.params);
  const body = validate(updateBodySchema, req.body);

  const model = requireModel(params.type);

  const exists = await model.findUnique({
    where: { id: params.itemId },
    select: { id: true, offerId: true },
  });

  if (!exists || exists.offerId !== params.offerId) throw httpError(404, "Item not found");

  const updated = await model.update({
    where: { id: params.itemId },
    data: {
      ...(body.text !== undefined ? { text: body.text } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
    select: itemSelect,
  });

  res.json(updated);
};

exports.remove = async (req, res) => {
  const params = validate(itemParamsSchema, req.params);

  const model = requireModel(params.type);

  const exists = await model.findUnique({
    where: { id: params.itemId },
    select: { id: true, offerId: true },
  });

  if (!exists || exists.offerId !== params.offerId) throw httpError(404, "Item not found");

  await model.delete({ where: { id: params.itemId } });
  res.json({ message: "Deleted" });
};

exports.reorder = async (req, res) => {
  const params = validate(addParamsSchema, req.params);
  const body = validate(reorderBodySchema, req.body);

  const model = requireModel(params.type);

  let itemsToUpdate = [];
  if (body.items) {
    itemsToUpdate = body.items;
  } else if (body.ids) {
    itemsToUpdate = body.ids.map((id, index) => ({
      id,
      sortOrder: index * 10,
    }));
  }

  const ids = itemsToUpdate.map((x) => x.id);

  const found = await model.findMany({
    where: { id: { in: ids } },
    select: { id: true, offerId: true },
  });

  if (found.length !== ids.length || found.some((x) => x.offerId !== params.offerId)) {
    throw httpError(400, "Invalid ids for this offer");
  }

  await prisma.$transaction(
    itemsToUpdate.map((it) => model.update({ where: { id: it.id }, data: { sortOrder: it.sortOrder } }))
  );

  const items = await model.findMany({
    where: { offerId: params.offerId },
    select: itemSelect,
    orderBy: { sortOrder: "asc" },
  });

  res.json({ message: "OK", items });
};
