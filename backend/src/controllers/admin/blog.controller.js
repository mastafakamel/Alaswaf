const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

// =========================
// Helpers
// =========================
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueBlogSlug(base) {
  const clean = slugify(base) || "post";
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? clean : `${clean}-${Math.floor(Math.random() * 10000)}`;
    const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${clean}-${Date.now()}`;
}

function httpError(statusCode, message, details) {
  const e = new Error(message);
  e.statusCode = statusCode;
  if (details) e.details = details;
  return e;
}

// =========================
// Schemas
// =========================
const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().min(1).max(100).optional(),
  published: z.union([z.literal("true"), z.literal("false")]).optional(),
  sort: z.enum(["newest", "oldest", "published_desc"]).optional().default("newest"),
});

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(1).max(220).optional(),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().trim().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  authorName: z.string().trim().max(100).optional().default("فريق الأسواف"),
  metaTitle: z.string().trim().max(200).optional().nullable(),
  metaDescription: z.string().trim().max(300).optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  slug: z.string().trim().min(1).max(220).optional(),
});

// PATCH /toggle-publish : لا يحتاج body
const scheduleBodySchema = z.object({
  publishAt: z.coerce.date().nullable(),
});

// =========================
// Selectors
// =========================
function selectList() {
  return {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    coverImageUrl: true,
    authorName: true,
    isPublished: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
  };
}

function selectFull() {
  return {
    ...selectList(),
    content: true,
    metaTitle: true,
    metaDescription: true,
  };
}

// =========================
// Controllers
// =========================

/**
 * GET /api/admin/blog
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
          { excerpt: { contains: query.q, mode: "insensitive" } },
        ],
      }
      : {}),
    ...(query.published ? { isPublished: query.published === "true" } : {}),
    deletedAt: null,
  };

  const orderBy =
    query.sort === "oldest"
      ? { createdAt: "asc" }
      : query.sort === "published_desc"
        ? { publishedAt: "desc" }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({ where, select: selectList(), orderBy, skip, take: query.limit }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({ page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), items });
};

/**
 * GET /api/admin/blog/:id
 */
exports.getOne = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const post = await prisma.blogPost.findFirst({
    where: { id: params.id, deletedAt: null },
    select: selectFull()
  });
  if (!post) throw httpError(404, "Post not found");

  res.json(post);
};

/**
 * POST /api/admin/blog
 */
exports.create = async (req, res) => {
  const data = validate(createSchema, req.body);

  const slug = data.slug ? slugify(data.slug) : await uniqueBlogSlug(data.title);

  if (data.slug) {
    const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (exists) throw httpError(409, "Slug already exists");
  }

  // publish now if isPublished true and no publishedAt
  const isPublished = data.isPublished ?? false;
  const publishedAt = isPublished ? data.publishedAt ?? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? "",
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? "",
      authorName: data.authorName ?? "فريق الأسواف",
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      isPublished,
      publishedAt,
    },
    select: selectFull(),
  });

  res.status(201).json(post);
};

/**
 * PUT /api/admin/blog/:id
 */
exports.update = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const data = validate(updateSchema, req.body);

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) throw httpError(404, "Post not found");

  let slug;
  if (data.slug) {
    slug = slugify(data.slug);
    const conflict = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (conflict && conflict.id !== params.id) throw httpError(409, "Slug already exists");
  }

  // نشر/سحب نشر + جدولة
  let publishedAtUpdate = undefined;
  if (data.isPublished !== undefined) {
    publishedAtUpdate = data.isPublished ? data.publishedAt ?? new Date() : null;
  } else if (data.publishedAt !== undefined) {
    publishedAtUpdate = data.publishedAt;
  }

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl ?? "" } : {}),
      ...(data.authorName !== undefined ? { authorName: data.authorName } : {}),
      ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle ?? null } : {}),
      ...(data.metaDescription !== undefined ? { metaDescription: data.metaDescription ?? null } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      ...(publishedAtUpdate !== undefined ? { publishedAt: publishedAtUpdate } : {}),
    },
    select: selectFull(),
  });

  res.json(post);
};

/**
 * DELETE /api/admin/blog/:id
 */
exports.remove = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const exists = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) throw httpError(404, "Post not found");

  await prisma.blogPost.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });
  res.json({ message: "Post moved to trash" });
};

/**
 * PATCH /api/admin/blog/:id/toggle-publish
 */
exports.togglePublish = async (req, res) => {
  const params = validate(idParamsSchema, req.params);

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    select: { id: true, isPublished: true },
  });
  if (!post) throw httpError(404, "Post not found");

  const next = !post.isPublished;

  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      isPublished: next,
      publishedAt: next ? new Date() : null,
    },
    select: selectList(),
  });

  res.json({ message: "OK", post: updated });
};

/**
 * PATCH /api/admin/blog/:id/schedule
 * body: { publishAt: Date | null }
 */
exports.schedulePublish = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(scheduleBodySchema, req.body);

  const exists = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) throw httpError(404, "Post not found");

  const publishAt = body.publishAt;

  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      isPublished: publishAt ? true : false,
      publishedAt: publishAt,
    },
    select: selectList(),
  });

  res.json({ message: "OK", post: updated });
};
