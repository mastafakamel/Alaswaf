const { z } = require("zod");
const { prisma } = require("../../db/prisma");
const { validate } = require("../../utils/validate");

// =========================
// Schema
// =========================
const leadBodySchema = z.object({
    offerId: z
        .string()
        .trim()
        .min(1)
        .optional()
        .nullable()
        .transform((v) => (v && v.trim() ? v.trim() : null)),

    name: z.string().trim().max(100).optional().default(""),
    phone: z.string().trim().max(30).optional().default(""),
    message: z.string().trim().max(1000).optional().default(""),

    source: z.enum(["WHATSAPP", "CONTACT"]),
});

// =========================
// Handler
// =========================
exports.create = async (req, res) => {
    const body = validate(leadBodySchema, req.body);

    // (اختياري لكن نظيف) لو offerId موجود نتأكد إنه موجود
    if (body.offerId) {
        const exists = await prisma.offer.findUnique({
        where: { id: body.offerId },
        select: { id: true },
        });

        if (!exists) {
        const e = new Error("Invalid offerId");
        e.statusCode = 400;
        throw e;
        }
    }

    const lead = await prisma.lead.create({
        data: {
        offerId: body.offerId,
        name: body.name,
        phone: body.phone,
        message: body.message,
        source: body.source,
        },
        select: {
        id: true,
        createdAt: true,
        },
    });

    res.status(201).json({ message: "Lead created", ...lead });
};
