const { prisma } = require("../../db/prisma");
const { mapBranch } = require("../../utils/dto");

exports.list = async (req, res) => {
    const items = await prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { label: "asc" },
        select: {
            id: true,
            city: { select: { name: true, slug: true } },
            label: true,
            address: true,
            mapUrl: true,
            whatsappE164: true,
            phones: {
                select: { id: true, label: true, phone: true, sortOrder: true },
                orderBy: { sortOrder: "asc" },
            },
        },
    });

    res.json({ items: items.map(mapBranch) });
};
