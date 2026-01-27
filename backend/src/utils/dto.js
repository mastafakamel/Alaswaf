/**
 * DTO (Data Transfer Object) Mappers
 * Standardizes how we send data to the frontend, removing sensitive or unnecessary fields.
 */

const mapOffer = (o) => {
    if (!o) return null;
    return {
        id: o.id,
        title: o.title,
        slug: o.slug,
        summary: o.summary,
        description: o.description,
        price: o.price,
        currency: o.currency,
        category: o.category,
        departureCity: o.departureCity ? {
            id: o.departureCity.id,
            name: o.departureCity.name,
            slug: o.departureCity.slug
        } : null,
        images: (o.images || []).map(img => ({
            id: img.id,
            url: img.url,
            alt: img.alt
        })),
        coverImageUrl: o.images?.[0]?.url || null,
        tags: (o.tags || []).map(t => ({ id: t.tag?.id || t.id, name: t.tag?.name || t.name })),
        featured: o.featured,
        startDate: o.startDate,
        endDate: o.endDate,
        durationDays: o.durationDays,
        durationNights: o.durationNights,
        offerType: o.offerType,

        // Hijri Dates
        hijriStartDate: (o.startDateHijriYear && o.startDateHijriMonth && o.startDateHijriDay)
            ? { year: o.startDateHijriYear, month: o.startDateHijriMonth, day: o.startDateHijriDay }
            : null,
        hijriEndDate: (o.endDateHijriYear && o.endDateHijriMonth && o.endDateHijriDay)
            ? { year: o.endDateHijriYear, month: o.endDateHijriMonth, day: o.endDateHijriDay }
            : null,

        runText: o.runText,
        pickupInfo: o.pickupInfo,
        cancellationPolicy: o.cancellationPolicy,
        whatsappNumber: o.departureCity?.branches?.[0]?.whatsappE164 || "966503673733",
        createdAt: o.createdAt
    };
};

const mapBlogPost = (p) => {
    if (!p) return null;
    return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: p.coverImageUrl,
        authorName: p.authorName,
        publishedAt: p.publishedAt,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription
    };
};

const mapBranch = (b) => {
    if (!b) return null;
    return {
        id: b.id,
        label: b.label,
        city: b.city ? { name: b.city.name, slug: b.city.slug } : null,
        address: b.address,
        mapUrl: b.mapUrl,
        whatsappE164: b.whatsappE164,
        phones: (b.phones || []).map(p => ({
            label: p.label,
            phone: p.phone
        }))
    };
};



const mapCity = (c) => {
    if (!c) return null;
    return {
        id: c.id,
        name: c.name,
        slug: c.slug
    };
};

module.exports = {
    mapOffer,
    mapBlogPost,
    mapBranch,
    mapCity
};
