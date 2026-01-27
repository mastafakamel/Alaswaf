const { ZodError } = require("zod");
const logger = require("./logger");

function validate(schema, data) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        const err = parsed.error;
        const flat = err.flatten();

        // Build a helpful message
        const fieldErrors = flat.fieldErrors;
        const keys = Object.keys(fieldErrors);
        const firstField = keys[0];
        const firstMsg = fieldErrors[firstField]?.[0] || "";

        const message = keys.length > 0 ? `${firstField}: ${firstMsg}` : "Validation Error";

        logger.warn(`Validation failed: ${message}`, {
            fields: keys,
            data: process.env.NODE_ENV === "development" ? data : undefined
        });

        const e = new Error(message);
        e.statusCode = 400;
        e.code = "VALIDATION_ERROR";
        e.details = flat;
        throw e;
    }
    return parsed.data;
}

module.exports = { validate, ZodError };
