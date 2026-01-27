import { Helmet } from 'react-helmet-async';

export default function SEO({
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    keywords
}) {
    const siteName = 'الأسواف للحج والعمرة';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'الأسواف لخدمات الحج والعمرة والرحلات السياحية. رحلات متكاملة بأفضل الأسعار والخدمات.';

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* RTL Support */}
            <html lang="ar" dir="rtl" />
        </Helmet>
    );
}
