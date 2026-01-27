const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

function httpError(statusCode, message, details) {
  const e = new Error(message);
  e.statusCode = statusCode;
  if (details) e.details = details;
  return e;
}

// تاريخ: يقبل ISO أو YYYY-MM-DD
const dateString = z
  .string()
  .trim()
  .min(1)
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date format");

const LeadStatus = z.enum(["PENDING", "CONTACTED", "CONVERTED", "CLOSED"]);

const idParamsSchema = z.object({ id: z.string().trim().min(1) });

const updateSchema = z.object({
  status: LeadStatus.optional(),
  notes: z.string().optional(),
});

const leadsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),

  // filters
  source: z.enum(["WHATSAPP", "CONTACT"]).optional(),
  offerId: z.string().trim().min(1).optional(),
  status: LeadStatus.optional(),

  from: dateString.optional(),
  to: dateString.optional(),

  q: z.string().trim().min(1).max(100).optional(),
});

/**
 * @openapi
 * /admin/leads:
 *   get:
 *     summary: List all leads (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONTACTED, CONVERTED, CLOSED]
 *     responses:
 *       200:
 *         description: Success
 */
exports.list = async (req, res) => {
  const query = validate(leadsListQuerySchema, req.query);
  const skip = (query.page - 1) * query.limit;

  // date range
  let createdAt = undefined;
  if (query.from || query.to) {
    const range = {};
    if (query.from) range.gte = new Date(query.from);
    if (query.to) range.lte = new Date(query.to);

    // sanity: from <= to
    if (range.gte && range.lte && range.gte > range.lte) {
      throw httpError(400, "`from` must be <= `to`");
    }

    createdAt = range;
  }

  const where = {
    deletedAt: null, // Filter out soft-deleted leads
    ...(query.source ? { source: query.source } : {}),
    ...(query.offerId ? { offerId: query.offerId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(query.q
      ? {
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { phone: { contains: query.q, mode: "insensitive" } },
          { message: { contains: query.q, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        name: true,
        phone: true,
        message: true,
        source: true,
        status: true,
        notes: true,
        createdAt: true,
        offerId: true,
        offer: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  res.json({
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
    items,
  });
};

// Update lead status/notes
exports.update = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  const body = validate(updateSchema, req.body);

  const item = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  res.json(item);
};

// Soft delete lead
exports.remove = async (req, res) => {
  const params = validate(idParamsSchema, req.params);
  await prisma.lead.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });
  res.json({ message: "Lead moved to trash" });
};
