const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");
const { toGregorian, toHijri } = require("../../utils/hijriConverter");

// =========================
// Helpers
// =========================
function httpError(statusCode, message, details) {
  const e = new Error(message);
  e.statusCode = statusCode;
  if (details) e.details = details;
  return e;
}

// ✅ Dynamic: Now we use cityId (cuid) instead of enum
// DepartureCity enum is gone.

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base) {
  const clean = slugify(base) || "offer";
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? clean : `${clean}-${Math.floor(Math.random() * 10000)}`;
    const exists = await prisma.offer.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${clean}-${Date.now()}`;
}

function normalizeOffer(o) {
  return {
    ...o,
    coverImageUrl: o.images?.[0]?.url ?? null,
    tags: (o.tags || []).map((x) => x.tag),
  };
}

// =========================
// Schemas
// =========================
const idParamsSchema = z.object({ id: z.string().trim().min(1) });

// Helper to convert empty string to null before coercion
const coerceEmpty = (schema) => z.preprocess((val) => (val === "" ? null : val), schema);

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(1).max(220).optional(),
  summary: z.string().optional().default(""),
  description: z.string().optional().default(""),
  price: coerceEmpty(z.coerce.number().int().min(0)),
  currency: z.string().trim().min(1).max(10).default("SAR"),
  departureCityId: z.string().trim().min(2),
  categoryId: z.string().trim().min(2),

  startDate: coerceEmpty(z.coerce.date().optional().nullable()),
  endDate: coerceEmpty(z.coerce.date().optional().nullable()),

  startDateHijriYear: coerceEmpty(z.coerce.number().int().optional().nullable()),
  startDateHijriMonth: coerceEmpty(z.coerce.number().int().optional().nullable()),
  startDateHijriDay: coerceEmpty(z.coerce.number().int().optional().nullable()),
  endDateHijriYear: coerceEmpty(z.coerce.number().int().optional().nullable()),
  endDateHijriMonth: coerceEmpty(z.coerce.number().int().optional().nullable()),
  endDateHijriDay: coerceEmpty(z.coerce.number().int().optional().nullable()),

  durationDays: coerceEmpty(z.coerce.number().int().optional().nullable()),
  durationNights: coerceEmpty(z.coerce.number().int().optional().nullable()),
  offerType: z.enum(["GROUP", "PRIVATE"]).optional().default("GROUP"),
  runText: z.string().optional().default(""),
  pickupInfo: z.string().optional().default(""),
  cancellationPolicy: z.string().optional().default(""),

  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),

  isActive: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),

  // Nested Lists (Optional for simple create)
  highlights: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  whatToBring: z.array(z.string()).optional(),
  priceTiers: z.array(z.object({
    label: z.string(),
    price: z.number().int().min(0),
    currency: z.string().optional().default("SAR"),
  })).optional(),
  itinerary: z.array(z.object({
    dayNumber: z.number().int(),
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
  tagIds: z.array(z.string()).optional(), // Added for tag management
});

const updateSchema = createSchema.partial().extend({
  slug: z.string().trim().min(1).max(220).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  cityId: z.string().optional(),
  departureCityId: z.string().optional(), // Added to match frontend
  active: z.union([z.literal("true"), z.literal("false"), z.literal("")]).optional(),
  featured: z.union([z.literal("true"), z.literal("false"), z.literal("")]).optional(),
  tags: z.string().optional(), // Added for tag filtering
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional().default("newest"),
});

const featureBodySchema = z.object({
  featured: z.boolean().optional(),
});

// =========================
// Selectors
// =========================
function adminOfferSelectFull() {
  return {
    id: true,
    title: true,
    slug: true,
    summary: true,
    description: true,
    price: true,
    currency: true,
    departureCityId: true,
    departureCity: { select: { id: true, name: true, slug: true } },
    categoryId: true,
    category: { select: { id: true, name: true, slug: true, icon: true } },
    startDate: true,
    endDate: true,
    startDateHijriYear: true,
    startDateHijriMonth: true,
    startDateHijriDay: true,
    endDateHijriYear: true,
    endDateHijriMonth: true,
    endDateHijriDay: true,
    durationDays: true,
    durationNights: true,
    offerType: true,
    runText: true,
    pickupInfo: true,
    cancellationPolicy: true,
    metaTitle: true,
    metaDescription: true,
    isActive: true,
    featured: true,
    createdAt: true,
    updatedAt: true,
    images: {
      select: { id: true, url: true, sortOrder: true, createdAt: true },
      orderBy: { sortOrder: "asc" },
    },
    tags: {
      select: { tag: { select: { id: true, name: true } } },
    },
    itinerary: {
      select: { id: true, dayNumber: true, title: true, description: true, imageUrl: true },
      orderBy: { dayNumber: "asc" },
    },
    highlights: { select: { id: true, text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    includes: { select: { id: true, text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    excludes: { select: { id: true, text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    whatToBring: { select: { id: true, text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    priceTiers: { select: { id: true, label: true, price: true, currency: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    tags: {
      select: { tag: { select: { id: true, name: true } } },
    },
  };
}

function adminOfferSelectList() {
  return {
    id: true,
    title: true,
    slug: true,
    price: true,
    currency: true,
    departureCityId: true,
    departureCity: { select: { name: true } },
    categoryId: true,
    category: { select: { name: true, icon: true } },
    isActive: true,
    featured: true,
    createdAt: true,
    updatedAt: true,
    images: {
      select: { url: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
      take: 1,
    },
    tags: { select: { tag: { select: { id: true, name: true } } } },
  };
}

// =========================
// Controllers
// =========================

/**
 * GET /api/admin/offers
 */
exports.list = async (req, res) => {
  const query = validate(listQuerySchema, req.query);
  const skip = (query.page - 1) * query.limit;

  const where = {
    ...(query.q
      ? {
        OR: [
          { title: { contains: query.q, mode: "insensitive" } },
          { slug: { contains: query.q, mode: "insensitive" } },
        ],
      }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.cityId || query.departureCityId ? { departureCityId: query.cityId || query.departureCityId } : {}),
    ...(query.active ? { isActive: query.active === "true" } : {}),
    ...(query.featured ? { featured: query.featured === "true" } : {}),
    ...(query.tags
      ? {
        tags: {
          some: {
            tag: {
              OR: [
                { id: { contains: query.tags, mode: "insensitive" } },
                { name: { contains: query.tags, mode: "insensitive" } },
              ],
            },
          },
        },
      }
      : {}),
    deletedAt: null, // Avoid soft deleted
  };

  const orderBy =
    query.sort === "oldest"
      ? { createdAt: "asc" }
      : query.sort === "price_asc"
        ? { price: "asc" }
        : query.sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

  const [itemsRaw, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      select: adminOfferSelectList(),
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.offer.count({ where }),
  ]);

  res.json({
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
    items: itemsRaw.map(normalizeOffer),
  });
};

/**
 * GET /api/admin/offers/:id
 */
exports.getOne = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const offer = await prisma.offer.findFirst({
    where: { id: params.id, deletedAt: null },
    select: adminOfferSelectFull(),
  });

  if (!offer) throw httpError(404, "Offer not found");

  res.json(normalizeOffer(offer));
};

/**
 * POST /api/admin/offers
 */
exports.create = async (req, res) => {
  const body = validate(createSchema, req.body);

  const slug = body.slug ? slugify(body.slug) : await uniqueSlug(body.title);

  if (body.slug) {
    const exists = await prisma.offer.findUnique({ where: { slug }, select: { id: true } });
    if (exists) throw httpError(409, "Slug already exists");
  }

  // Handle Hijri dates - convert to Gregorian if provided
  let startDate = body.startDate ?? null;
  let endDate = body.endDate ?? null;

  if (body.startDateHijriYear && body.startDateHijriMonth && body.startDateHijriDay) {
    startDate = toGregorian(body.startDateHijriYear, body.startDateHijriMonth, body.startDateHijriDay);
  }

  if (body.endDateHijriYear && body.endDateHijriMonth && body.endDateHijriDay) {
    endDate = toGregorian(body.endDateHijriYear, body.endDateHijriMonth, body.endDateHijriDay);
  }

  const offerValue = {
    title: body.title,
    slug,
    summary: body.summary ?? "",
    description: body.description ?? "",
    price: body.price,
    currency: body.currency ?? "SAR",
    departureCityId: body.departureCityId,
    categoryId: body.categoryId,
    startDate,
    endDate,
    startDateHijriYear: body.startDateHijriYear ?? null,
    startDateHijriMonth: body.startDateHijriMonth ?? null,
    startDateHijriDay: body.startDateHijriDay ?? null,
    endDateHijriYear: body.endDateHijriYear ?? null,
    endDateHijriMonth: body.endDateHijriMonth ?? null,
    endDateHijriDay: body.endDateHijriDay ?? null,
    durationDays: body.durationDays ?? null,
    durationNights: body.durationNights ?? null,
    offerType: body.offerType ?? "GROUP",
    runText: body.runText ?? "",
    pickupInfo: body.pickupInfo ?? "",
    cancellationPolicy: body.cancellationPolicy ?? "",
    metaTitle: body.metaTitle ?? "",
    metaDescription: body.metaDescription ?? "",
    isActive: body.isActive ?? true,
    featured: body.featured ?? false,
    tags: {
      create: (body.tagIds || []).map((tagId) => ({ tagId })),
    },
  };


  const offer = await prisma.offer.create({
    data: {
      ...offerValue,
      highlights: body.highlights
        ? { create: body.highlights.map((t, idx) => ({ text: t, sortOrder: idx })) }
        : undefined,
      includes: body.includes
        ? { create: body.includes.map((t, idx) => ({ text: t, sortOrder: idx })) }
        : undefined,
      excludes: body.excludes
        ? { create: body.excludes.map((t, idx) => ({ text: t, sortOrder: idx })) }
        : undefined,
      whatToBring: body.whatToBring
        ? { create: body.whatToBring.map((t, idx) => ({ text: t, sortOrder: idx })) }
        : undefined,
      priceTiers: body.priceTiers
        ? { create: body.priceTiers.map((t, idx) => ({ ...t, sortOrder: idx })) }
        : undefined,
      itinerary: body.itinerary
        ? {
          create: body.itinerary.map((it) => ({
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description || "",
            imageUrl: it.imageUrl || "",
          })),
        }
        : undefined,
    },
    select: adminOfferSelectFull(),
  });

  res.status(201).json(normalizeOffer(offer));
};

/**
 * PUT /api/admin/offers/:id
 */
exports.update = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(updateSchema, req.body);

  const existing = await prisma.offer.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true },
  });
  if (!existing) throw httpError(404, "Offer not found");

  let slug;
  if (body.slug) {
    slug = slugify(body.slug);
    const conflict = await prisma.offer.findUnique({ where: { slug }, select: { id: true } });
    if (conflict && conflict.id !== params.id) throw httpError(409, "Slug already exists");
  }

  // Handle Hijri dates - convert to Gregorian if provided
  let startDate, endDate;

  if (body.startDateHijriYear && body.startDateHijriMonth && body.startDateHijriDay) {
    startDate = toGregorian(body.startDateHijriYear, body.startDateHijriMonth, body.startDateHijriDay);
  } else if (body.startDate !== undefined) {
    startDate = body.startDate;
  }

  if (body.endDateHijriYear && body.endDateHijriMonth && body.endDateHijriDay) {
    endDate = toGregorian(body.endDateHijriYear, body.endDateHijriMonth, body.endDateHijriDay);
  } else if (body.endDate !== undefined) {
    endDate = body.endDate;
  }

  const updateData = {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(slug !== undefined ? { slug } : {}),
    ...(body.summary !== undefined ? { summary: body.summary } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.price !== undefined ? { price: body.price } : {}),
    ...(body.currency !== undefined ? { currency: body.currency } : {}),
    ...(body.departureCityId !== undefined ? { departureCityId: body.departureCityId } : {}),
    ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
    ...(startDate !== undefined ? { startDate } : {}),
    ...(endDate !== undefined ? { endDate } : {}),
    ...(body.startDateHijriYear !== undefined ? { startDateHijriYear: body.startDateHijriYear } : {}),
    ...(body.startDateHijriMonth !== undefined ? { startDateHijriMonth: body.startDateHijriMonth } : {}),
    ...(body.startDateHijriDay !== undefined ? { startDateHijriDay: body.startDateHijriDay } : {}),
    ...(body.endDateHijriYear !== undefined ? { endDateHijriYear: body.endDateHijriYear } : {}),
    ...(body.endDateHijriMonth !== undefined ? { endDateHijriMonth: body.endDateHijriMonth } : {}),
    ...(body.endDateHijriDay !== undefined ? { endDateHijriDay: body.endDateHijriDay } : {}),
    ...(body.durationDays !== undefined ? { durationDays: body.durationDays } : {}),
    ...(body.durationNights !== undefined ? { durationNights: body.durationNights } : {}),
    ...(body.offerType !== undefined ? { offerType: body.offerType } : {}),
    ...(body.runText !== undefined ? { runText: body.runText } : {}),
    ...(body.pickupInfo !== undefined ? { pickupInfo: body.pickupInfo } : {}),
    ...(body.cancellationPolicy !== undefined ? { cancellationPolicy: body.cancellationPolicy } : {}),
    ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle } : {}),
    ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    ...(body.featured !== undefined ? { featured: body.featured } : {}),
  };

  // Transaction for nested updates
  const offer = await prisma.$transaction(async (tx) => {
    // 1. Scalar fields
    const updated = await tx.offer.update({
      where: { id: params.id },
      data: updateData,
    });

    // 2. Highlights
    if (body.highlights !== undefined) {
      await tx.offerHighlight.deleteMany({ where: { offerId: params.id } });
      await tx.offerHighlight.createMany({
        data: body.highlights.map((text, idx) => ({
          offerId: params.id,
          text,
          sortOrder: idx,
        })),
      });
    }

    // 3. Includes
    if (body.includes !== undefined) {
      await tx.offerInclude.deleteMany({ where: { offerId: params.id } });
      await tx.offerInclude.createMany({
        data: body.includes.map((text, idx) => ({
          offerId: params.id,
          text,
          sortOrder: idx,
        })),
      });
    }

    // 4. Excludes
    if (body.excludes !== undefined) {
      await tx.offerExclude.deleteMany({ where: { offerId: params.id } });
      await tx.offerExclude.createMany({
        data: body.excludes.map((text, idx) => ({
          offerId: params.id,
          text,
          sortOrder: idx,
        })),
      });
    }

    // 5. whatToBring
    if (body.whatToBring !== undefined) {
      await tx.offerWhatToBring.deleteMany({ where: { offerId: params.id } });
      await tx.offerWhatToBring.createMany({
        data: body.whatToBring.map((text, idx) => ({
          offerId: params.id,
          text,
          sortOrder: idx,
        })),
      });
    }

    // 6. Price Tiers
    if (body.priceTiers !== undefined) {
      await tx.offerPriceTier.deleteMany({ where: { offerId: params.id } });
      await tx.offerPriceTier.createMany({
        data: body.priceTiers.map((pt, idx) => ({
          offerId: params.id,
          label: pt.label,
          price: pt.price,
          currency: pt.currency || "SAR",
          sortOrder: idx,
        })),
      });
    }

    // 7. Itinerary
    if (body.itinerary !== undefined) {
      await tx.offerItinerary.deleteMany({ where: { offerId: params.id } });
      await tx.offerItinerary.createMany({
        data: body.itinerary.map((it) => ({
          offerId: params.id,
          dayNumber: it.dayNumber,
          title: it.title,
          description: it.description || "",
          imageUrl: it.imageUrl || "",
          sortOrder: it.dayNumber,
        })),
      });
    }

    // 8. Tags
    if (body.tagIds !== undefined) {
      await tx.offerTag.deleteMany({ where: { offerId: params.id } });
      await tx.offerTag.createMany({
        data: body.tagIds.map((tagId) => ({
          offerId: params.id,
          tagId,
        })),
      });
    }

    return tx.offer.findUnique({
      where: { id: params.id },
      select: adminOfferSelectFull(),
    });
  });

  res.json(normalizeOffer(offer));
};

/**
 * DELETE /api/admin/offers/:id
 */
exports.remove = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const existing = await prisma.offer.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) throw httpError(404, "Offer not found");

  // Soft delete
  await prisma.offer.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  res.json({ message: "Offer moved to trash" });
};

/**
 * POST /api/admin/offers/:id/duplicate
 * duplicates offer + images + tags
 */
exports.duplicate = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      price: true,
      currency: true,
      departureCityId: true,
      categoryId: true,
      startDate: true,
      endDate: true,
      images: { select: { url: true, sortOrder: true } },
      tags: { select: { tagId: true } },
    },
  });

  if (!offer) throw httpError(404, "Offer not found");

  const newSlug = await uniqueSlug(`${offer.title}-copy`);
  const newTitle = `${offer.title} (Copy)`;

  const created = await prisma.offer.create({
    data: {
      title: newTitle,
      slug: newSlug,
      description: offer.description ?? "",
      price: offer.price,
      currency: offer.currency,
      departureCityId: offer.departureCityId,
      categoryId: offer.categoryId,
      startDate: offer.startDate,
      endDate: offer.endDate,

      // النسخة الجديدة: مراجعة الأول
      isActive: false,
      featured: false,

      images: {
        create: (offer.images || []).map((img) => ({
          url: img.url,
          sortOrder: img.sortOrder ?? 0,
        })),
      },
      tags: {
        create: (offer.tags || []).map((t) => ({ tagId: t.tagId })),
      },
    },
    select: adminOfferSelectFull(),
  });

  res.status(201).json({
    message: "Offer duplicated",
    offer: normalizeOffer(created),
  });
};

/**
 * PATCH /api/admin/offers/:id/toggle-active
 */
exports.toggleActive = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    select: { id: true, isActive: true },
  });
  if (!offer) throw httpError(404, "Offer not found");

  const updated = await prisma.offer.update({
    where: { id: params.id },
    data: { isActive: !offer.isActive },
    select: { id: true, isActive: true },
  });

  res.json({ message: "OK", ...updated });
};

/**
 * PATCH /api/admin/offers/:id/feature
 * body: { featured: true/false } OR toggle if missing
 */
exports.feature = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(featureBodySchema, req.body ?? {});

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    select: { id: true, featured: true },
  });
  if (!offer) throw httpError(404, "Offer not found");

  const nextValue = body.featured !== undefined ? body.featured : !offer.featured;

  const updated = await prisma.offer.update({
    where: { id: params.id },
    data: { featured: nextValue },
    select: { id: true, featured: true },
  });

  res.json({ message: "OK", ...updated });
};
