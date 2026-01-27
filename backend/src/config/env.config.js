require("dotenv").config();
const { z } = require("zod");

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    PORT: z.coerce.number().int().default(9000),
    CORS_ORIGINS: z.string().optional().default(""),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
}

module.exports = parsed.data;
