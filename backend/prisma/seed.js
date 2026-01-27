/* prisma/seed.js */
require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function safeDeleteMany(modelName) {
  try {
    await prisma[modelName].deleteMany();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🌱 Seeding (YOUR schema: Offer -> City)...");

  // ---------------------------
  // 1) Clean DB (order matters)
  // ---------------------------
  await safeDeleteMany("blogPostTag");
  await safeDeleteMany("blogTag");
  await safeDeleteMany("blogPost");

  await safeDeleteMany("lead");

  await safeDeleteMany("offerPriceTier");
  await safeDeleteMany("offerWhatToBring");
  await safeDeleteMany("offerExclude");
  await safeDeleteMany("offerInclude");
  await safeDeleteMany("offerHighlight");
  await safeDeleteMany("offerItinerary");

  await safeDeleteMany("offerImage");
  await safeDeleteMany("offerTag");
  await safeDeleteMany("tag");

  await safeDeleteMany("offer");

  await safeDeleteMany("branchPhone");
  await safeDeleteMany("branch");

  await safeDeleteMany("city");
  await safeDeleteMany("admin");

  // ---------------------------
  // 2) Admin (default)
  // ---------------------------
  const adminEmail = "admin@alaswaf.sa";
  const adminPass = "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPass, 10);

  await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  // ---------------------------
  // 3) Cities
  // ---------------------------
  const citiesData = [
    { name: "الرياض", slug: "riyadh", isActive: true },
    { name: "الدمام", slug: "dammam", isActive: true },
  ];

  const cities = [];
  for (const c of citiesData) {
    cities.push(await prisma.city.create({ data: c }));
  }
  const cityBySlug = Object.fromEntries(cities.map((c) => [c.slug, c]));

  // ---------------------------
  // 4) Branches + Phones (linked to City)
  // ---------------------------
  const branchesData = [
    {
      citySlug: "riyadh",
      label: "فرع الرياض - العليا",
      address: "العليا، الرياض",
      mapUrl: "https://www.google.com/maps?q=Riyadh",
      whatsappE164: "+966500000001",
      phones: [
        { label: "مكتب", phone: "+966112222221", sortOrder: 0 },
        { label: "خدمة العملاء", phone: "+966112222222", sortOrder: 1 },
      ],
    },
    {
      citySlug: "dammam",
      label: "فرع الدمام",
      address: "الدمام",
      mapUrl: "https://www.google.com/maps?q=Dammam",
      whatsappE164: "+966500000002",
      phones: [{ label: "مكتب", phone: "+966133333331", sortOrder: 0 }],
    },
  ];

  for (const b of branchesData) {
    const city = cityBySlug[b.citySlug];
    if (!city) throw new Error(`City not found for slug: ${b.citySlug}`);

    await prisma.branch.create({
      data: {
        cityId: city.id,
        label: b.label,
        address: b.address ?? "",
        mapUrl: b.mapUrl ?? "",
        whatsappE164: b.whatsappE164,
        isActive: true,
        phones: {
          create: (b.phones || []).map((p) => ({
            label: p.label ?? "",
            phone: p.phone,
            sortOrder: p.sortOrder ?? 0,
          })),
        },
      },
    });
  }

  // ---------------------------
  // 5) Tags
  // ---------------------------
  const tagNames = ["اقتصادي", "VIP", "عائلات", "موسمي", "رحلات سريعة"];
  const tags = [];
  for (const name of tagNames) {
    tags.push(await prisma.tag.create({ data: { name } }));
  }

  function pickRandom(arr, n) {
    const copy = [...arr];
    copy.sort(() => 0.5 - Math.random());
    return copy.slice(0, n);
  }

  // ---------------------------
  // 6) Offers (10) + Images + OfferTag
  // ---------------------------
  const offerSeed = Array.from({ length: 10 }).map((_, i) => {
    const title = `برنامج عمرة ${i + 1} - 5 أيام مكة والمدينة`;

    // alternates between Riyadh/Dammam
    const citySlug = i % 2 === 0 ? "riyadh" : "dammam";
    const city = cityBySlug[citySlug];

    return {
      title,
      slug: `${slugify(title)}-${i + 1}`,
      summary: "ملخص قصير للعرض يظهر في الكروت.",
      description: "وصف تجريبي للعرض (سيتم تعديله من الأدمن).",
      price: 1200 + i * 50,
      currency: "SAR",
      departureCityId: city.id, // ✅ REQUIRED in your schema
      category: "UMRAH",
      isActive: i % 3 !== 0,
      featured: i < 4,
      startDate: new Date(),
      endDate: null,

      durationDays: 5,
      durationNights: 4,
      offerType: i % 2 === 0 ? "GROUP" : "PRIVATE",
      runText: "يوميًا",
      pickupInfo: "نقطة تجمع يتم إرسالها عبر واتساب",
      cancellationPolicy: "سياسة إلغاء تجريبية",

      metaTitle: title,
      metaDescription: "وصف ميتا تجريبي للعرض.",
    };
  });

  const createdOffers = [];

  for (let i = 0; i < offerSeed.length; i++) {
    const data = offerSeed[i];

    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        description: data.description,
        price: data.price,
        currency: data.currency,

        departureCityId: data.departureCityId, // ✅

        category: data.category,
        isActive: data.isActive,
        featured: data.featured,
        startDate: data.startDate,
        endDate: data.endDate,

        durationDays: data.durationDays,
        durationNights: data.durationNights,
        offerType: data.offerType,
        runText: data.runText,
        pickupInfo: data.pickupInfo,
        cancellationPolicy: data.cancellationPolicy,

        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,

        images: {
          create: [
            {
              url: `https://picsum.photos/seed/alaswaf-offer-${i + 1}-1/900/600`,
              alt: `صورة ${i + 1}-1`,
              sortOrder: 0,
            },
            {
              url: `https://picsum.photos/seed/alaswaf-offer-${i + 1}-2/900/600`,
              alt: `صورة ${i + 1}-2`,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    createdOffers.push(offer);

    const picked = pickRandom(tags, 2);
    await prisma.offerTag.createMany({
      data: picked.map((t) => ({ offerId: offer.id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  // ---------------------------
  // 7) Blog (optional) + BlogTags
  // ---------------------------
  const blogTagNames = ["عمرة", "نصائح", "مكة", "المدينة"];
  const blogTags = [];
  for (const name of blogTagNames) {
    blogTags.push(await prisma.blogTag.create({ data: { name } }));
  }

  const blogPosts = [
    {
      title: "فضل العمرة وأثرها الروحي",
      excerpt: "نظرة سريعة على فضل العمرة وكيفية الاستعداد لها.",
      content: "محتوى تجريبي… سيتم تعديله من الأدمن.",
      coverImageUrl: "https://picsum.photos/seed/blog1/1200/700",
      authorName: "فريق الأسواف",
      isPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      tagPick: 2,
    },
    {
      title: "دليل مختصر لأهم سنن الطواف",
      excerpt: "أهم السنن والنصائح أثناء الطواف.",
      content: "محتوى تجريبي… سيتم تعديله من الأدمن.",
      coverImageUrl: "https://picsum.photos/seed/blog2/1200/700",
      authorName: "فريق الأسواف",
      isPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      tagPick: 2,
    },
    {
      title: "نصائح صحية أثناء السفر",
      excerpt: "كيف تحافظ على صحتك في رحلة العمرة.",
      content: "محتوى تجريبي… سيتم تعديله من الأدمن.",
      coverImageUrl: "https://picsum.photos/seed/blog3/1200/700",
      authorName: "فريق الأسواف",
      isPublished: false,
      publishedAt: null,
      tagPick: 1,
    },
  ];

  for (let i = 0; i < blogPosts.length; i++) {
    const p = blogPosts[i];
    const slug = `${slugify(p.title)}-${i + 1}`;
    const pickedTags = pickRandom(blogTags, p.tagPick || 1);

    await prisma.blogPost.create({
      data: {
        title: p.title,
        slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: p.coverImageUrl,
        authorName: p.authorName,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        tags: {
          create: pickedTags.map((t) => ({ tagId: t.id })),
        },
      },
    });
  }

  // ---------------------------
  // 8) Leads (3 demo)
  // ---------------------------
  await prisma.lead.createMany({
    data: [
      {
        offerId: createdOffers[0]?.id ?? null,
        name: "Ahmed",
        phone: "+201000000001",
        message: "عايز أعرف التفاصيل وأقرب موعد.",
        source: "WHATSAPP",
      },
      {
        offerId: createdOffers[1]?.id ?? null,
        name: "Mostafa",
        phone: "+201000000002",
        message: "هل يوجد خصم للعائلات؟",
        source: "WHATSAPP",
      },
      {
        offerId: null,
        name: "Sara",
        phone: "+201000000003",
        message: "محتاج أرقام الفروع في الرياض.",
        source: "CONTACT",
      },
    ],
  });

  console.log("✅ Seed completed");
  console.log(`- Admin: ${adminEmail} (password: ${adminPass})`);
  console.log(`- Cities: ${cities.length}`);
  console.log(`- Branches: ${branchesData.length} + phones`);
  console.log(`- Offers: ${createdOffers.length} + images + tags`);
  console.log(`- Blog: ${blogPosts.length} + blog tags`);
  console.log("- Leads: 3");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
