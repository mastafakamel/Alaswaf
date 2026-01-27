const { ZodError } = require("zod");
const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;
    const isClientError = status >= 400 && status < 500;

    if (!isClientError) {
        logger.error(`Server Error: ${err.message}`, {
            requestId: req.id,
            url: req.url,
            stack: err.stack,
            method: req.method
        });
    } else {
        logger.warn(`Client Error: ${err.message}`, {
            requestId: req.id,
            status,
            url: req.url
        });
    }

    // Zod (لو حد رمى ZodError مباشرة)
    if (err instanceof ZodError) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request",
                details: err.flatten(),
            },
        });
    }

    return res.status(status).json({
        ok: false,
        error: {
            code:
                status === 400 ? "BAD_REQUEST"
                    : status === 401 ? "UNAUTHORIZED"
                        : status === 403 ? "FORBIDDEN"
                            : status === 404 ? "NOT_FOUND"
                                : "INTERNAL_SERVER_ERROR",
            message: err.message || "Something went wrong",
            ...(err.details ? { details: err.details } : {}),
        },
    });
}

module.exports = { errorHandler };
