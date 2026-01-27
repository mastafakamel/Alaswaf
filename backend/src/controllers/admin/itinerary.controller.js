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

const itemSelect = {
  id: true,
  dayNumber: true,
  title: true,
  description: true,
  imageUrl: true,
  sortOrder: true,
};

// =========================
// Schemas
// =========================
const offerIdParamsSchema = z.object({
  offerId: z.string().trim().min(1),
});

const offerItemParamsSchema = z.object({
  offerId: z.string().trim().min(1),
  itemId: z.string().trim().min(1),
});

const addBodySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().trim().min(2).max(200),
  description: z.string().optional().default(""),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const updateBodySchema = z.object({
  dayNumber: z.coerce.number().int().min(1).optional(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

const reorderBodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        sortOrder: z.coerce.number().int().min(0),
        dayNumber: z.coerce.number().int().min(1).optional(),
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
  const params = validate(offerIdParamsSchema, req.params);
  const body = validate(addBodySchema, req.body);

  const offer = await prisma.offer.findUnique({
    where: { id: params.offerId },
    select: { id: true },
  });
  if (!offer) throw httpError(404, "Offer not found");

  const item = await prisma.offerItinerary.create({
    data: {
      offerId: params.offerId,
      dayNumber: body.dayNumber,
      title: body.title,
      description: body.description ?? "",
      imageUrl: body.imageUrl ?? "",
      sortOrder: body.sortOrder ?? 0,
    },
    select: itemSelect,
  });

  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const params = validate(offerItemParamsSchema, req.params);
  const body = validate(updateBodySchema, req.body);

  const exists = await prisma.offerItinerary.findUnique({
    where: { id: params.itemId },
    select: { id: true, offerId: true },
  });

  if (!exists || exists.offerId !== params.offerId) {
    throw httpError(404, "Item not found");
  }

  const updated = await prisma.offerItinerary.update({
    where: { id: params.itemId },
    data: {
      ...(body.dayNumber !== undefined ? { dayNumber: body.dayNumber } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl ?? "" } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
    select: itemSelect,
  });

  res.json(updated);
};

exports.remove = async (req, res) => {
  const params = validate(offerItemParamsSchema, req.params);

  const exists = await prisma.offerItinerary.findUnique({
    where: { id: params.itemId },
    select: { id: true, offerId: true },
  });

  if (!exists || exists.offerId !== params.offerId) {
    throw httpError(404, "Item not found");
  }

  await prisma.offerItinerary.delete({ where: { id: params.itemId } });
  res.json({ message: "Itinerary item deleted" });
};

exports.reorder = async (req, res) => {
  const params = validate(offerIdParamsSchema, req.params);
  const body = validate(reorderBodySchema, req.body);

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

  const found = await prisma.offerItinerary.findMany({
    where: { id: { in: ids } },
    select: { id: true, offerId: true },
  });

  if (found.length !== ids.length || found.some((x) => x.offerId !== params.offerId)) {
    throw httpError(400, "Invalid itinerary ids for this offer");
  }

  await prisma.$transaction(
    itemsToUpdate.map((it) =>
      prisma.offerItinerary.update({
        where: { id: it.id },
        data: {
          sortOrder: it.sortOrder,
          ...(it.dayNumber !== undefined ? { dayNumber: it.dayNumber } : {}),
        },
      })
    )
  );

  const items = await prisma.offerItinerary.findMany({
    where: { offerId: params.offerId },
    select: itemSelect,
    orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
  });

  res.json({ message: "OK", items });
};
