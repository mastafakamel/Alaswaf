const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

// Helpers
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

// Schemas
const idParamsSchema = z.object({ id: z.string().trim().min(1) });

const createSchema = z.object({
    name: z.string().trim().min(2).max(100),
    slug: z.string().trim().min(2).max(120).optional(),
    isActive: z.boolean().optional().default(true),
});

const updateSchema = createSchema.partial();

/**
 * GET /api/admin/cities
 */
exports.list = async (req, res) => {
    const items = await prisma.city.findMany({
        orderBy: { name: "asc" },
    });
    res.json(items);
};

/**
 * GET /api/admin/cities/:id
 */
exports.getOne = async (req, res) => {
    const params = validate(idParamsSchema, req.params);
    const item = await prisma.city.findUnique({ where: { id: params.id } });
    if (!item) throw httpError(404, "City not found");
    res.json(item);
};

/**
 * POST /api/admin/cities
 */
exports.create = async (req, res) => {
    const body = validate(createSchema, req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    // Check unique slug
    const exists = await prisma.city.findFirst({ where: { OR: [{ name: body.name }, { slug }] } });
    if (exists) throw httpError(409, "City name or slug already exists");

    const item = await prisma.city.create({
        data: {
            name: body.name,
            slug,
            isActive: body.isActive,
        },
    });
    res.status(201).json(item);
};

/**
 * PUT /api/admin/cities/:id
 */
exports.update = async (req, res) => {
    const params = validate(idParamsSchema, req.params);
    const body = validate(updateSchema, req.body);

    const existing = await prisma.city.findUnique({ where: { id: params.id } });
    if (!existing) throw httpError(404, "City not found");

    let slug = existing.slug;
    if (body.slug) {
        slug = slugify(body.slug);
    } else if (body.name) {
        slug = slugify(body.name);
    }

    const conflict = await prisma.city.findFirst({
        where: {
            OR: [
                body.name ? { name: body.name } : null,
                { slug }
            ].filter(Boolean),
            NOT: { id: params.id }
        }
    });
    if (conflict) throw httpError(409, "City name or slug already exists");

    const item = await prisma.city.update({
        where: { id: params.id },
        data: {
            ...(body.name && { name: body.name }),
            slug,
            ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
    });
    res.json(item);
};

/**
 * DELETE /api/admin/cities/:id
 */
exports.remove = async (req, res) => {
    const params = validate(idParamsSchema, req.params);

    // Check if city has branches or offers
    const city = await prisma.city.findUnique({
        where: { id: params.id },
        include: { _count: { select: { branches: true, offers: true } } }
    });

    if (!city) throw httpError(404, "City not found");
    if (city._count.branches > 0 || city._count.offers > 0) {
        throw httpError(400, "Cannot delete city with existing branches or offers");
    }

    await prisma.city.delete({ where: { id: params.id } });
    res.json({ message: "City deleted" });
};
