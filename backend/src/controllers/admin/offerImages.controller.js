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
// Schemas
// =========================
const offerIdParamsSchema = z.object({
  offerId: z.string().trim().min(1),
});

const removeParamsSchema = z.object({
  offerId: z.string().trim().min(1),
  imageId: z.string().trim().min(1),
});

const addBodySchema = z.object({
  url: z.string().url(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
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
// Select
// =========================
const imageSelect = { id: true, url: true, sortOrder: true, createdAt: true };

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

  const img = await prisma.offerImage.create({
    data: { offerId: params.offerId, url: body.url, sortOrder: body.sortOrder ?? 0 },
    select: imageSelect,
  });

  res.status(201).json(img);
};

exports.remove = async (req, res) => {
  const params = validate(removeParamsSchema, req.params);

  const img = await prisma.offerImage.findUnique({
    where: { id: params.imageId },
    select: { id: true, offerId: true },
  });

  if (!img || img.offerId !== params.offerId) throw httpError(404, "Image not found");

  await prisma.offerImage.delete({ where: { id: params.imageId } });
  res.json({ message: "Image deleted" });
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

  const found = await prisma.offerImage.findMany({
    where: { id: { in: ids } },
    select: { id: true, offerId: true },
  });

  if (found.length !== ids.length || found.some((x) => x.offerId !== params.offerId)) {
    throw httpError(400, "Invalid image ids for this offer");
  }

  await prisma.$transaction(
    itemsToUpdate.map((it) =>
      prisma.offerImage.update({
        where: { id: it.id },
        data: { sortOrder: it.sortOrder },
      })
    )
  );

  const images = await prisma.offerImage.findMany({
    where: { offerId: params.offerId },
    select: { id: true, url: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  res.json({ message: "OK", images });
};
