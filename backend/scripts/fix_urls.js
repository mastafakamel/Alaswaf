const { prisma, shutdownPrisma } = require("../src/db/prisma");

async function fixUrls() {
    console.log("Starting URL fix script...");
    const oldUrl = "http://localhost:9000";
    // const newUrl = "http://192.168.1.4:9000";
    const newUrl = "http://10.40.78.78:9000";

    try {
        // 1. Fix Categories
        const categories = await prisma.category.findMany({
            where: { icon: { contains: oldUrl } }
        });
        console.log(`Found ${categories.length} categories to fix.`);
        for (const cat of categories) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { icon: cat.icon.replace(oldUrl, newUrl) }
            });
        }

        // 2. Fix Offer Images
        const offerImages = await prisma.offerImage.findMany({
            where: { url: { contains: oldUrl } }
        });
        console.log(`Found ${offerImages.length} offer images to fix.`);
        for (const img of offerImages) {
            await prisma.offerImage.update({
                where: { id: img.id },
                data: { url: img.url.replace(oldUrl, newUrl) }
            });
        }

        // 3. Fix Blog Posts
        const blogPosts = await prisma.blogPost.findMany({
            where: { coverImageUrl: { contains: oldUrl } }
        });
        console.log(`Found ${blogPosts.length} blog posts to fix.`);
        for (const post of blogPosts) {
            await prisma.blogPost.update({
                where: { id: post.id },
                data: { coverImageUrl: post.coverImageUrl.replace(oldUrl, newUrl) }
            });
        }

        console.log("URL fix completed successfully! ✅");
    } catch (error) {
        console.error("Error fixing URLs:", error);
    } finally {
        await shutdownPrisma();
    }
}

fixUrls();
