import { Link } from 'react-router-dom';
import LazyImage from '../components/common/LazyImage';
import './About.css';

export default function About() {
    const stats = [
        { value: '+30', label: 'سنة خبرة' },
        { value: '+50K', label: 'معتمر سعيد' },
        { value: '100%', label: 'رضا العملاء' },
        { value: '2', label: 'فروع بالمملكة' },
    ];

    const values = [
        {
            icon: (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
            ),
            title: 'الموثوقية',
            description: 'نلتزم بأعلى معايير المصداقية والشفافية في جميع تعاملاتنا مع عملائنا الكرام.',
        },
        {
            icon: (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            ),
            title: 'الاهتمام',
            description: 'نهتم بكل تفصيلة في رحلتك لضمان تجربة روحانية مريحة وسلسة.',
        },
        {
            icon: (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L18 9l-9 9z" />
                </svg>
            ),
            title: 'الجودة',
            description: 'نختار أفضل الفنادق والخدمات لنقدم لكم تجربة عالية الجودة.',
        },
        {
            icon: (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
            ),
            title: 'الفريق المتميز',
            description: 'فريق عمل محترف ومتخصص يعمل على خدمتكم على مدار الساعة.',
        },
    ];

    return (
        <main className="about-page">
            {/* Hero */}
            <section className="page-header">
                <div className="container">
                    <nav className="breadcrumb">
                        <Link to="/">الرئيسية</Link>
                        <span>/</span>
                        <span>من نحن</span>
                    </nav>
                    <h1 className="page-header__title">من نحن</h1>
                    <p className="page-header__subtitle">
                        الأسواف للسياحة والسفر - شريككم الموثوق منذ أكثر من 30 عاماً
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="about-stats">
                <div className="container">
                    <div className="about-stats__grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="about-stat">
                                <span className="about-stat__value">{stat.value}</span>
                                <span className="about-stat__label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="section about-story">
                <div className="container">
                    <div className="about-story__grid">
                        <div className="about-story__content">
                            <h2 className="section-title">قصتنا</h2>
                            <p>
                                بدأت رحلة الأسواف للسياحة والسفر قبل أكثر من 15 عاماً برؤية واضحة:
                                تقديم خدمات سياحية متميزة تليق بضيوف الرحمن. انطلقنا من الرياض
                                بفريق صغير وحلم كبير، وبفضل الله ثم بفضل ثقة عملائنا، نمونا لنصبح
                                واحدة من الشركات الرائدة في مجال العمرة والحج.
                            </p>
                            <p>
                                اليوم، نفتخر بخدمة أكثر من 50 ألف معتمر وحاج، ونسعى دائماً لتطوير
                                خدماتنا وتوسيع نطاق عملنا لنكون أقرب إليكم. مع فروعنا في الرياض والدمام،
                                نحن بانتظاركم لنرافقكم في رحلتكم الروحانية.
                            </p>
                        </div>
                        <div className="about-story__image">
                            <div className="about-story__image-wrapper">
                                <div className="about-story__decoration"></div>
                                <LazyImage
                                    src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600"
                                    alt="المسجد الحرام"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section about-mission bg-gray">
                <div className="container">
                    <div className="about-mission__grid">
                        <div className="about-mission__card">
                            <div className="about-mission__icon">
                                <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                            </div>
                            <h3>رؤيتنا</h3>
                            <p>
                                أن نكون الخيار الأول والأفضل لكل من يسعى لأداء مناسك العمرة والحج،
                                من خلال تقديم خدمات استثنائية تجمع بين الجودة العالية والأسعار المناسبة.
                            </p>
                        </div>
                        <div className="about-mission__card">
                            <div className="about-mission__icon">
                                <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                            </div>
                            <h3>مهمتنا</h3>
                            <p>
                                نسعى لتيسير رحلة العمرة والحج لعملائنا من خلال توفير باقات متكاملة
                                تشمل جميع الخدمات، مع ضمان أعلى مستويات الراحة والأمان طوال الرحلة.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section about-values">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">قيمنا</h2>
                        <p className="section-subtitle">
                            المبادئ التي نلتزم بها في كل ما نقدمه
                        </p>
                    </div>
                    <div className="about-values__grid">
                        {values.map((value, idx) => (
                            <div key={idx} className="about-value-card">
                                <div className="about-value-card__icon">
                                    {value.icon}
                                </div>
                                <h3 className="about-value-card__title">{value.title}</h3>
                                <p className="about-value-card__text">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
