const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

// =========================
// Helpers
// =========================
function httpError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    return e;
}

function slugify(str) {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^\w\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// =========================
// Schemas
// =========================
const idParamsSchema = z.object({ id: z.string().trim().min(1) });

const createSchema = z.object({
    name: z.string().trim().min(2).max(50),
    slug: z.string().trim().min(1).max(60).optional(),
    icon: z.string().optional().default("🕋"),
    isActive: z.boolean().optional().default(true),
});

const updateSchema = createSchema.partial();

// =========================
// Controllers
// =========================

/**
 * GET /api/admin/categories
 */
exports.list = async (req, res) => {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(categories);
};

/**
 * GET /api/admin/categories/:id
 */
exports.getOne = async (req, res) => {
    const params = validate(idParamsSchema, req.params);
    const category = await prisma.category.findUnique({
        where: { id: params.id },
    });
    if (!category) throw httpError(404, "Category not found");
    res.json(category);
};

/**
 * POST /api/admin/categories
 */
exports.create = async (req, res) => {
    const body = validate(createSchema, req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    // Check unique name/slug
    const exists = await prisma.category.findFirst({
        where: { OR: [{ name: body.name }, { slug }] },
    });
    if (exists) throw httpError(409, "Category name or slug already exists");

    const category = await prisma.category.create({
        data: {
            name: body.name,
            slug,
            icon: body.icon,
            isActive: body.isActive,
        },
    });

    res.status(201).json(category);
};

/**
 * PUT /api/admin/categories/:id
 */
exports.update = async (req, res) => {
    const params = validate(idParamsSchema, req.params);
    const body = validate(updateSchema, req.body);

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) throw httpError(404, "Category not found");

    let slug;
    if (body.slug) {
        slug = slugify(body.slug);
    } else if (body.name) {
        slug = slugify(body.name);
    }

    // Check unique constraints if name/slug changed
    if (body.name || slug) {
        const conflict = await prisma.category.findFirst({
            where: {
                AND: [
                    { id: { not: params.id } },
                    { OR: [{ name: body.name }, { slug }] }
                ]
            },
        });
        if (conflict) throw httpError(409, "Category name or slug already exists");
    }

    const updated = await prisma.category.update({
        where: { id: params.id },
        data: {
            ...body,
            ...(slug ? { slug } : {}),
        },
    });

    res.json(updated);
};

/**
 * DELETE /api/admin/categories/:id
 */
exports.remove = async (req, res) => {
    const params = validate(idParamsSchema, req.params);

    // Check if any offers use this category
    const count = await prisma.offer.count({
        where: { categoryId: params.id, deletedAt: null },
    });
    if (count > 0) {
        throw httpError(400, "Cannot delete category used by active offers. Reassign those offers first.");
    }

    await prisma.category.delete({ where: { id: params.id } });
    res.json({ message: "Category deleted" });
};

/**
 * PATCH /api/admin/categories/:id/toggle-active
 */
exports.toggleActive = async (req, res) => {
    const params = validate(idParamsSchema, req.params);
    const existing = await prisma.category.findUnique({
        where: { id: params.id },
        select: { isActive: true },
    });
    if (!existing) throw httpError(404, "Category not found");

    const updated = await prisma.category.update({
        where: { id: params.id },
        data: { isActive: !existing.isActive },
    });

    res.json(updated);
};
