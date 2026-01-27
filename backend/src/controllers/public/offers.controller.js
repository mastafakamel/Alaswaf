const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { mapOffer } = require("../../utils/dto");
const { validate } = require("../../utils/validate");

// Enums (query safety)
// 
// Dynamic Cities handled by query params

// =========================
// Schemas
// =========================

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),

  category: z.string().optional(), // Category ID or Slug
  city: z.string().optional(), // Can be Slug or ID

  // default true for public
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? true : v === "true")),

  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
      return String(v)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }),

  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
});

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

// =========================
// Selectors
// =========================

// ✅ list selector ثابت (بدون summary عشان ما نحتاجش fallback)
function offersListSelect() {
  return {
    id: true,
    title: true,
    slug: true,
    description: true,
    price: true,
    currency: true,
    departureCity: { select: { id: true, name: true, slug: true } },
    category: { select: { id: true, name: true, slug: true, icon: true } },
    isActive: true,
    featured: true,
    startDate: true,
    startDateHijriYear: true,
    startDateHijriMonth: true,
    startDateHijriDay: true,
    durationDays: true,
    runText: true,
    createdAt: true,
    updatedAt: true,
    images: {
      select: { url: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
      take: 1,
    },
    tags: {
      select: { tag: { select: { id: true, name: true } } },
    },
  };
}

function mapOfferListItem(o) {
  const tags = (o.tags || []).map((x) => x.tag);
  const coverImageUrl = o.images?.[0]?.url ?? null;

  return {
    id: o.id,
    title: o.title,
    slug: o.slug,
    summary: (o.description || "").slice(0, 160),
    price: o.price,
    currency: o.currency,
    departureCity: o.departureCity,
    category: o.category,
    isActive: o.isActive,
    featured: o.featured,
    startDate: o.startDate,
    hijriStartDate: (o.startDateHijriYear && o.startDateHijriMonth && o.startDateHijriDay)
      ? { year: o.startDateHijriYear, month: o.startDateHijriMonth, day: o.startDateHijriDay }
      : null,
    durationDays: o.durationDays,
    runText: o.runText,
    coverImageUrl,
    tags,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

// =========================
// Handlers
// =========================

exports.list = async (req, res) => {
  const query = validate(listQuerySchema, req.query);
  const skip = (query.page - 1) * query.limit;

  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.category
      ? {
        category: {
          OR: [{ id: query.category }, { slug: query.category }],
        },
      }
      : {}),
    ...(query.city
      ? {
        departureCity: {
          OR: [{ id: query.city }, { slug: query.city }],
        },
      }
      : {}),
    ...(query.tags?.length
      ? {
        tags: { some: { tag: { name: { in: query.tags } } } },
      }
      : {}),
    deletedAt: null,
  };

  const orderBy =
    query.sort === "price_asc"
      ? { price: "asc" }
      : query.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [itemsRaw, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      select: offersListSelect(),
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.offer.count({ where }),
  ]);

  const items = itemsRaw.map(mapOfferListItem);

  res.json({
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
    items,
  });
};

exports.bySlug = async (req, res) => {
  const params = validate(slugParamsSchema, req.params);

  // ✅ Full details (لو العلاقات موجودة في schema)
  // لو العلاقات مش موجودة -> Prisma هيعمل error
  // عشان كده هنستخدم fallback صغير "محدد" مش try/catch ضخم
  try {
    const offer = await prisma.offer.findFirst({
      where: { slug: params.slug, isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        departureCity: {
          select: {
            id: true,
            name: true,
            slug: true,
            branches: { where: { isActive: true }, select: { whatsappE164: true }, take: 1 },
          },
        },
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
        isActive: true,
        featured: true,
        createdAt: true,
        updatedAt: true,

        images: {
          select: { url: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },

        tags: { select: { tag: { select: { id: true, name: true } } } },

        // العلاقات الإضافية (لو موجودة عندك)
        itinerary: {
          select: { dayNumber: true, title: true, description: true, imageUrl: true, sortOrder: true },
          orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
        },
        highlights: { select: { text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        includes: { select: { text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        excludes: { select: { text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        whatToBring: { select: { text: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        priceTiers: { select: { label: true, price: true, currency: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },

        metaTitle: true,
        metaDescription: true,
        runText: true,
      },
    });

    if (!offer) {
      const e = new Error("Offer not found");
      e.statusCode = 404;
      throw e;
    }

    const tags = (offer.tags || []).map((x) => x.tag);

    const related = await prisma.offer.findMany({
      where: {
        isActive: true,
        categoryId: offer.category.id,
        departureCityId: offer.departureCity.id,
        id: { not: offer.id },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        images: { select: { url: true, sortOrder: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    res.json({
      ...mapOffer(offer),
      itinerary: offer.itinerary || [],
      highlights: offer.highlights || [],
      includes: offer.includes || [],
      excludes: offer.excludes || [],
      whatToBring: offer.whatToBring || [],
      priceTiers: offer.priceTiers || [],
      related: related.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        price: r.price,
        currency: r.currency,
        coverImageUrl: r.images?.[0]?.url ?? null,
      })),
    });
  } catch (err) {
    // fallback minimal: Offer + images + tags only
    const offer = await prisma.offer.findFirst({
      where: { slug: params.slug, isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        departureCity: {
          select: {
            name: true,
            branches: { where: { isActive: true }, select: { whatsappE164: true }, take: 1 },
          },
        },
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
        isActive: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        images: { select: { url: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
        metaTitle: true,
        metaDescription: true,
        runText: true,
      },
    });

    if (!offer) {
      const e = new Error("Offer not found");
      e.statusCode = 404;
      throw e;
    }

    const tags = (offer.tags || []).map((x) => x.tag);

    res.json({
      ...offer,
      summary: (offer.description || "").slice(0, 160),
      tags,
      itinerary: [],
      highlights: [],
      includes: [],
      excludes: [],
      whatToBring: [],
      priceTiers: [],
      related: [],
      warning: "Extended offer sections not available in current schema yet",
    });
  }
};
