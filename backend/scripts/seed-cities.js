const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding initial cities...');

    const cities = [
        { name: 'الرياض', slug: 'riyadh' }, // Arabic names preferred for DB? Or English? Let's use what fits. The user used "Riyadh" in English but "الدمام والرياض" in prompt. I'll use common slugs.
        { name: 'الدمام', slug: 'dammam' },
    ];

    for (const city of cities) {
        const upserted = await prisma.city.upsert({
            where: { slug: city.slug },
            update: {},
            create: {
                name: city.name,
                slug: city.slug,
                isActive: true,
            },
        });
        console.log(`✅ City ensured: ${upserted.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
