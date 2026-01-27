const { z } = require("zod");

// --- Common Schemas ---
const idParam = z.object({
    id: z.string().trim().min(1, "ID is required"),
});

const paginationQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(30),
    q: z.string().trim().optional(),
});

// --- Auth Schemas ---
const loginSchema = z.object({
    username: z.string().trim().min(3, "Username must be at least 3 chars"),
    password: z.string().min(6, "Password must be at least 6 chars"),
});

// --- Lead Schemas ---
const leadStatusEnum = z.enum(["PENDING", "CONTACTED", "CONVERTED", "CLOSED"]);

const leadUpdateSchema = z.object({
    status: leadStatusEnum.optional(),
    notes: z.string().optional(),
});

// --- City Schemas ---
const citySchema = z.object({
    name: z.string().trim().min(2, "City name must be at least 2 chars"),
    isActive: z.boolean().default(true),
});

// --- Branch Schemas ---
const branchSchema = z.object({
    cityId: z.string().trim().min(1, "City ID is required"),
    label: z.string().trim().min(2, "Label is required"),
    whatsappE164: z.string().trim().min(5, "Invalid WhatsApp number"),
});

const branchPhoneSchema = z.object({
    label: z.string().trim().optional(),
    phoneE164: z.string().trim().min(5, "Invalid phone number"),
});

// --- Offer Schemas (Simplified) ---
const offerBaseSchema = z.object({
    title: z.string().trim().min(5, "Title is too short"),
    slug: z.string().trim().min(5, "Slug is too short").optional(),
    description: z.string().trim().min(10, "Description is too short"),
    price: z.number().positive().nullable().optional(),
    currency: z.string().default("SAR"),
    category: z.string().min(1, "Category is required"),
    departureCity: z.string().min(1, "Departure city is required"),
    isActive: z.boolean().default(true),
    featured: z.boolean().default(false),
    tagIds: z.array(z.string()).optional().default([]),
    imageUrls: z.array(z.string().url()).optional().default([]),
});

module.exports = {
    idParam,
    paginationQuery,
    loginSchema,
    leadStatusEnum,
    leadUpdateSchema,
    citySchema,
    branchSchema,
    branchPhoneSchema,
    offerBaseSchema,
};
