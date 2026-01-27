import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offersApi, blogApi, branchesApi } from '../api/client';
import SEO from '../components/layout/SEO';
import LazyImage from '../components/common/LazyImage';
import { formatDateForCard, formatHijriFromComponents } from '../utils/dateFormatter';
import './Home.css';

// Categories are now dynamic

// City labels map is now dynamic from the API (offer.departureCity.name)

export default function Home() {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, postsRes, branchesRes, categoriesRes] = await Promise.all([
          offersApi.getFeatured(4),
          blogApi.latest(3),
          branchesApi.list(),
          offersApi.categories(),
        ]);
        setFeaturedOffers(offersRes.items || []);
        setCategories(categoriesRes || []);
        console.log('Featured Offers Data:', offersRes.items);
        setLatestPosts(postsRes.items || []);
        setBranches(branchesRes.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="home">
      <SEO
        title="الرئيسية | رحلات الحج والعمرة"
        description="الأسواف لخدمات الحج والعمرة والرحلات السياحية. اكتشف أفضل عروض العمرة والحج من الرياض والدمام."
        keywords="عمرة, حج, رحلات سياحية, الرياض, الدمام, حجز فنادق"
      />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__background">
          {/* Slider Images */}
          <div className="hero__slider">
            <div
              className={`hero__slide hero__slide--1 ${currentSlide === 0 ? 'active' : ''}`}
            ></div>
            <div
              className={`hero__slide hero__slide--2 ${currentSlide === 1 ? 'active' : ''}`}
            ></div>
          </div>

          <div className="hero__overlay"></div>
          <div className="hero__pattern"></div>
        </div>
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">
              رحلات <span className="text-accent">العمرة والحج</span>
              <br />
              بأفضل الأسعار والخدمات
            </h1>
            <div className="hero__actions">
              <Link to="/offers" className="btn btn-glass">
                استعرض العروض
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 17l-5-5 5-5v10zm6-10l-5 5 5 5V7z" transform="scale(-1, 1) translate(-24, 0)" />
                </svg>
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-value">+30</span>
                <span className="hero__stat-label">سنة خبرة</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-value">+50K</span>
                <span className="hero__stat-label">معتمر سعيد</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-value">100%</span>
                <span className="hero__stat-label">رضا العملاء</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">خدماتنا</h2>
            <p className="section-subtitle">نقدم لكم مجموعة متنوعة من الخدمات لتلبية جميع احتياجاتكم</p>
          </div>
          <div className="categories__grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/offers?category=${cat.slug}`}
                className="category-card"
              >
                <span className="category-card__icon">
                  {cat.icon?.startsWith('http') ? (
                    <img src={cat.icon} alt={cat.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  ) : (
                    cat.icon || '🕋'
                  )}
                </span>
                <h3 className="category-card__title">{cat.name}</h3>
                <span className="category-card__arrow">←</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="section branches">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">فروعنا</h2>
            <p className="section-subtitle">تفضل بزيارة فروعنا المنتشرة لخدمتكم بشكل أفضل</p>
          </div>
          <div className="categories__grid">
            {branches.map((branch) => (
              <Link
                key={branch.id}
                to={`/offers?city=${branch.city?.slug}`}
                className="category-card"
              >
                <span className="category-card__icon">
                  <img src="/images/icon.png" alt="الأسواف" style={{ width: '50px', height: 'auto', objectFit: 'contain' }} />
                </span>
                <h3 className="category-card__title">{branch.label}</h3>
                <span className="category-card__arrow">←</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="section featured-offers bg-gray">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">أحدث العروض</h2>
              <p className="section-subtitle">اكتشف عروضنا المميزة بأفضل الأسعار</p>
            </div>
            <Link to="/offers" className="btn btn-outline hide-mobile">
              عرض الكل
            </Link>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <span className="loader"></span>
              <span>جاري التحميل...</span>
            </div>
          ) : featuredOffers.length > 0 ? (
            <div className="offers-grid">
              {featuredOffers.slice(0, 4).map((offer) => (
                <Link key={offer.id} to={`/offers/${offer.slug}`} className="offer-card card">
                  <div className="card-image">
                    {offer.coverImageUrl ? (
                      <LazyImage src={offer.coverImageUrl} alt={offer.title} />
                    ) : (
                      <div className="card-image__placeholder">
                        {offer.category?.icon?.startsWith('http') ? (
                          <img src={offer.category.icon} alt={offer.category.name} style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.5 }} />
                        ) : (
                          <span>{offer.category?.icon || '🕋'}</span>
                        )}
                      </div>
                    )}
                    <span className="offer-card__category badge badge-primary">
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: '4px' }}>
                        <path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9.5 18H8V9h1.5v9zm3.25 0h-1.5V9h1.5v9zm.75-12h-3V3.5h3V6zM16 18h-1.5V9H16v9z" />
                      </svg>
                      {offer.category?.name || 'غير مصنف'}
                    </span>
                    {offer.featured && (
                      <span className="offer-card__featured badge badge-accent">
                        مميز
                      </span>
                    )}
                  </div>

                  <div className="offer-card__floating-info">
                    <div className="info-item">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{offer.durationDays ? `${offer.durationDays} ${offer.durationDays === 1 ? 'يوم' : offer.durationDays === 2 ? 'يومان' : 'أيام'}` : 'غير متوفر'}</span>
                    </div>
                    <div className="info-divider"></div>
                    <div className="info-item">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {offer.hijriStartDate
                          ? formatHijriFromComponents(offer.hijriStartDate) + ' هـ'
                          : offer.startDate
                            ? formatDateForCard(offer.startDate)
                            : offer.runText || 'غير متوفر'}
                      </span>
                    </div>
                    <div className="info-divider"></div>
                    <div className="info-item">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{offer.departureCity?.name || 'غير متوفر'}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title text-center">{offer.title}</h3>

                    {offer.tags && offer.tags.length > 0 && (
                      <div className="offer-card__tags">
                        {offer.tags.map((tag) => (
                          <span key={tag.id} className="offer-tag-pill">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="offer-card__footer">
                      <div className="offer-card__price">
                        <span className="offer-card__price-value">{offer.price.toLocaleString()}</span>
                        <span className="offer-card__price-currency">{offer.currency}</span>
                      </div>
                      <span className="offer-card__cta">
                        التفاصيل →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>لا توجد عروض حالياً</p>
            </div>
          )}

          <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
            <Link to="/offers" className="btn btn-primary">
              استعرض جميع العروض
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="section why-us">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">لماذا الأسواف؟</h2>
            <p className="section-subtitle">نتميز بخدماتنا الاستثنائية التي تجعل رحلتك تجربة فريدة</p>
          </div>
          <div className="why-us__grid">
            <div className="why-us__card">
              <div className="why-us__icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </div>
              <h3 className="why-us__title">موثوقية وأمان</h3>
              <p className="why-us__text">أكثر من 30 عاماً من الخبرة في خدمة ضيوف الرحمن</p>
            </div>
            <div className="why-us__card">
              <div className="why-us__icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <h3 className="why-us__title">أسعار تنافسية</h3>
              <p className="why-us__text">نقدم أفضل الأسعار مع الحفاظ على جودة الخدمة العالية</p>
            </div>
            <div className="why-us__card">
              <div className="why-us__icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="why-us__title">خدمة متكاملة</h3>
              <p className="why-us__text">من الحجز حتى العودة، نرافقكم في كل خطوة</p>
            </div>
            <div className="why-us__card">
              <div className="why-us__icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                </svg>
              </div>
              <h3 className="why-us__title">دعم 24/7</h3>
              <p className="why-us__text">فريق دعم متاح على مدار الساعة لخدمتكم</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {
        latestPosts.length > 0 && (
          <section className="section latest-blog">
            <div className="container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">من مدونتنا</h2>
                  <p className="section-subtitle">نصائح ومقالات مفيدة لرحلتك</p>
                </div>
                <Link to="/blog" className="btn btn-outline hide-mobile">
                  جميع المقالات
                </Link>
              </div>
              <div className="blog-grid">
                {latestPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card card">
                    <div className="card-image">
                      {post.coverImageUrl ? (
                        <LazyImage src={post.coverImageUrl} alt={post.title} />
                      ) : (
                        <div className="card-image__placeholder">
                          <span>📝</span>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <time className="blog-card__date">
                        {new Date(post.publishedAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <h3 className="card-title">{post.title}</h3>
                      <p className="card-text">{post.excerpt}</p>
                      <span className="blog-card__read-more">
                        اقرأ المزيد →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      }

    </main >
  );
}
