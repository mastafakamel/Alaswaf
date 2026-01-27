const { prisma } = require("../../db/prisma");
const { mapCity } = require("../../utils/dto");

exports.list = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {};
        if (isActive === "true") where.isActive = true;

        const cities = await prisma.city.findMany({
            where,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        res.json({
            ok: true,
            items: cities.map(mapCity),
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message,
        });
    }
};
