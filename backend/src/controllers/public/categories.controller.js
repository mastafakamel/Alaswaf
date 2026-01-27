const { prisma } = require("../../db/prisma");

/**
 * GET /api/categories
 */
exports.list = async (req, res) => {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(categories);
};
