const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { mapBlogPost } = require("../../utils/dto");
const { validate } = require("../../utils/validate");

// =========================
// Schemas
// =========================

// GET /api/blog?page&limit&q
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().min(1).max(100).optional(),
});

// GET /api/blog/latest?limit
const latestQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(2),
});

// GET /api/blog/:slug
const slugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

// =========================
// Selectors
// =========================
function blogSelectList() {
  return {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    coverImageUrl: true,
    authorName: true,
    publishedAt: true,
  };
}

// شرط النشر النهائي (يدعم schedule)
function publishedWhere(extra = {}) {
  const now = new Date();
  return {
    isPublished: true,
    publishedAt: { not: null, lte: now },
    deletedAt: null,
    ...extra,
  };
}

// =========================
// Handlers
// =========================

exports.list = async (req, res) => {
  const query = validate(listQuerySchema, req.query);

  const skip = (query.page - 1) * query.limit;

  const where = publishedWhere(
    query.q
      ? {
        OR: [
          { title: { contains: query.q, mode: "insensitive" } },
          { excerpt: { contains: query.q, mode: "insensitive" } },
        ],
      }
      : {}
  );

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: blogSelectList(),
      orderBy: { publishedAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
    items: items.map(mapBlogPost),
  });
};

exports.latest = async (req, res) => {
  const query = validate(latestQuerySchema, req.query);

  const items = await prisma.blogPost.findMany({
    where: publishedWhere(),
    select: blogSelectList(),
    orderBy: { publishedAt: "desc" },
    take: query.limit,
  });

  res.json({ items: items.map(mapBlogPost) });
};

exports.bySlug = async (req, res) => {
  const params = validate(slugParamsSchema, req.params);

  const post = await prisma.blogPost.findFirst({
    where: publishedWhere({ slug: params.slug }),
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      authorName: true,
      publishedAt: true,
      metaTitle: true,
      metaDescription: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!post) {
    const e = new Error("Post not found");
    e.statusCode = 404;
    throw e;
  }

  res.json(mapBlogPost(post));
};
