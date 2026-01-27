import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { offersApi } from '../api/client';
import SEO from '../components/layout/SEO';
import LazyImage from '../components/common/LazyImage';
import { formatBothDates } from '../utils/dateFormatter';
import './OfferDetails.css';

// Categories are now dynamic

// City labels are now dynamic (offer.departureCity.name)

const offerTypeLabels = {
  GROUP: 'رحلة جماعية',
  PRIVATE: 'رحلة خاصة',
};

export default function OfferDetails() {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await offersApi.getBySlug(slug);
        setOffer(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [slug]);

  if (loading) {
    return (
      <main className="offer-details-page">
        <div className="loading-overlay" style={{ minHeight: '60vh' }}>
          <span className="loader"></span>
          <span>جاري تحميل تفاصيل العرض...</span>
        </div>
      </main>
    );
  }

  if (error || !offer) {
    return (
      <main className="offer-details-page">
        <div className="container">
          <div className="error-state">
            <h2>عذراً، لم نتمكن من العثور على هذا العرض</h2>
            <p>{error || 'العرض غير موجود أو تم حذفه'}</p>
            <Link to="/offers" className="btn btn-primary">
              العودة للعروض
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const images = offer.images || [];
  const whatsappMessage = encodeURIComponent(`مرحباً، أرغب في الاستفسار عن العرض: ${offer.title}`);

  return (
    <main className="offer-details-page">
      <SEO
        title={offer.title}
        description={offer.summary || offer.description?.replace(/<[^>]*>/g, '').substring(0, 160)}
        ogImage={offer.coverImageUrl || (offer.images?.[0]?.url)}
        ogType="article"
        keywords={`${offer.title}, ${offer.category?.name || ''}, الأسواف`}
      />
      {/* Hero Section */}
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <Link to="/offers">العروض</Link>
            <span>/</span>
            <span>{offer.title}</span>
          </nav>
        </div>
      </section>

      <div className="container">
        <div className="offer-details-layout">
          {/* Main Content */}
          <div className="offer-main">
            {/* Image Gallery */}
            <div className="offer-gallery">
              <div className="offer-gallery__main">
                {images.length > 0 ? (
                  <LazyImage src={images[activeImageIndex]?.url} alt={offer.title} />
                ) : (
                  <div className="offer-gallery__placeholder">
                    <span>🖼️</span>
                    <p>لا توجد صور</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="offer-gallery__thumbs">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`offer-gallery__thumb ${idx === activeImageIndex ? 'offer-gallery__thumb--active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <LazyImage src={img.url} alt={`${offer.title} - ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="offer-quick-info">
              <div className="offer-quick-info__item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div>
                  <span className="offer-quick-info__label">مدينة الانطلاق</span>
                  <span className="offer-quick-info__value">{offer.departureCity?.name || 'غير محدد'}</span>
                </div>
              </div>

              {(offer.startDate || offer.runText) && (
                <div className="offer-quick-info__item">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  <div>
                    <span className="offer-quick-info__label">تاريخ المغادرة</span>
                    <span className="offer-quick-info__value">
                      {offer.startDate ? formatBothDates(offer.startDate) : offer.runText}
                    </span>
                  </div>
                </div>
              )}

              {offer.durationDays && (
                <div className="offer-quick-info__item">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <div>
                    <span className="offer-quick-info__label">المدة</span>
                    <span className="offer-quick-info__value">
                      {offer.durationDays} {offer.durationDays === 1 ? 'يوم' : offer.durationDays === 2 ? 'يومان' : 'أيام'}
                      {offer.durationNights ? ` / ${offer.durationNights} ${offer.durationNights === 1 ? 'ليلة' : offer.durationNights === 2 ? 'ليلتان' : 'ليالي'}` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="offer-quick-info__item">
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {offer.category?.icon?.startsWith('http') ? (
                    <img src={offer.category.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    offer.category?.icon || '🕋'
                  )}
                </div>
                <div>
                  <span className="offer-quick-info__label">التصنيف</span>
                  <span className="offer-quick-info__value">{offer.category?.name || 'غير مصنف'}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="offer-tabs">
              <div className="offer-tabs__nav">
                <button
                  className={`offer-tabs__btn ${activeTab === 'description' ? 'offer-tabs__btn--active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  الوصف
                </button>
                {offer.itinerary?.length > 0 && (
                  <button
                    className={`offer-tabs__btn ${activeTab === 'itinerary' ? 'offer-tabs__btn--active' : ''}`}
                    onClick={() => setActiveTab('itinerary')}
                  >
                    برنامج الرحلة
                  </button>
                )}
                <button
                  className={`offer-tabs__btn ${activeTab === 'includes' ? 'offer-tabs__btn--active' : ''}`}
                  onClick={() => setActiveTab('includes')}
                >
                  يشمل / لا يشمل
                </button>
                {offer.whatToBring?.length > 0 && (
                  <button
                    className={`offer-tabs__btn ${activeTab === 'whatToBring' ? 'offer-tabs__btn--active' : ''}`}
                    onClick={() => setActiveTab('whatToBring')}
                  >
                    ماذا تحضر معك
                  </button>
                )}
                {(offer.cancellationPolicy || offer.pickupInfo || offer.runText) && (
                  <button
                    className={`offer-tabs__btn ${activeTab === 'policies' ? 'offer-tabs__btn--active' : ''}`}
                    onClick={() => setActiveTab('policies')}
                  >
                    معلومات إضافية
                  </button>
                )}
              </div>

              <div className="offer-tabs__content">
                {activeTab === 'description' && (
                  <div className="offer-description">
                    <div className="offer-description__text">
                      {offer.description ? (
                        <div dangerouslySetInnerHTML={{ __html: offer.description }} />
                      ) : (
                        <p>لا يوجد وصف متاح لهذا العرض.</p>
                      )}
                    </div>

                    {offer.highlights?.length > 0 && (
                      <div className="offer-highlights">
                        <h3>أبرز المميزات</h3>
                        <ul>
                          {offer.highlights.map((item, idx) => (
                            <li key={idx}>
                              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'itinerary' && offer.itinerary?.length > 0 && (
                  <div className="offer-itinerary-premium">
                    <div className="timeline">
                      {offer.itinerary.map((day, idx) => (
                        <div key={idx} className="timeline__item">
                          <div className="timeline__marker">
                            <div className="timeline__day-box">
                              <span className="timeline__day-label">اليوم</span>
                              <span className="timeline__day-number">{day.dayNumber}</span>
                            </div>
                          </div>
                          <div className="timeline__content">
                            <div className="timeline__card">
                              <h4>{day.title}</h4>
                              {day.description && <p>{day.description}</p>}
                              {day.imageUrl && (
                                <div className="timeline__img">
                                  <LazyImage src={day.imageUrl} alt={day.title} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'includes' && (
                  <div className="offer-premium-listing">
                    <div className="listing-card listing-card--includes">
                      <div className="listing-card__header">
                        <div className="listing-card__icon">✅</div>
                        <h3>يشمل العرض</h3>
                      </div>
                      <div className="listing-card__content">
                        {offer.includes?.length > 0 ? (
                          <ul className="check-list">
                            {offer.includes.map((item, idx) => (
                              <li key={idx}>
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty-msg">لم يتم تحديد ما يشمله العرض</p>
                        )}
                      </div>
                    </div>

                    <div className="listing-card listing-card--excludes">
                      <div className="listing-card__header">
                        <div className="listing-card__icon">❌</div>
                        <h3>لا يشمل</h3>
                      </div>
                      <div className="listing-card__content">
                        {offer.excludes?.length > 0 ? (
                          <ul className="cross-list">
                            {offer.excludes.map((item, idx) => (
                              <li key={idx}>
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty-msg">لم يتم تحديد ما لا يشمله العرض</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'whatToBring' && offer.whatToBring?.length > 0 && (
                  <div className="offer-what-to-bring">
                    <div className="section-header-compact">
                      <div className="section-icon">🧳</div>
                      <h3>أشياء ننصح بإحضارها</h3>
                    </div>
                    <ul className="premium-list">
                      {offer.whatToBring.map((item, idx) => (
                        <li key={idx}>
                          <div className="list-bullet">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" />
                            </svg>
                          </div>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="offer-policies-grid">
                    {offer.runText && (
                      <div className="policy-card">
                        <div className="policy-card__icon">📅</div>
                        <div className="policy-card__info">
                          <h4>مواعيد الرحلة</h4>
                          <p>{offer.runText}</p>
                        </div>
                      </div>
                    )}
                    {offer.pickupInfo && (
                      <div className="policy-card">
                        <div className="policy-card__icon">📍</div>
                        <div className="policy-card__info">
                          <h4>معلومات الاستلام</h4>
                          <p>{offer.pickupInfo}</p>
                        </div>
                      </div>
                    )}
                    {offer.cancellationPolicy && (
                      <div className="policy-card">
                        <div className="policy-card__icon">🛡️</div>
                        <div className="policy-card__info">
                          <h4>سياسة الإلغاء</h4>
                          <p>{offer.cancellationPolicy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="offer-sidebar">
            <div className="offer-booking-card">
              <div className="offer-booking-card__header">
                <span className="badge badge-primary">
                  {offer.category?.icon?.startsWith('http') ? (
                    <img src={offer.category.icon} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain', marginLeft: '4px' }} />
                  ) : (
                    <span style={{ marginLeft: '4px' }}>{offer.category?.icon || '🕋'}</span>
                  )}
                  {offer.category?.name || 'غير مصنف'}
                </span>
                {offer.featured && <span className="badge badge-accent">مميز</span>}
              </div>

              <h1 className="offer-booking-card__title">{offer.title}</h1>

              {offer.tags && offer.tags.length > 0 && (
                <div className="offer-booking-card__tags">
                  {offer.tags.map((tag) => (
                    <span key={tag.id} className="offer-tag-pill">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {(offer.durationDays || offer.durationNights) && (
                <div className="offer-booking-card__duration">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>
                    {offer.durationDays && `${offer.durationDays} ${offer.durationDays === 1 ? 'يوم' : offer.durationDays === 2 ? 'يومان' : 'أيام'}`}
                    {offer.durationDays && offer.durationNights && ' / '}
                    {offer.durationNights && `${offer.durationNights} ${offer.durationNights === 1 ? 'ليلة' : offer.durationNights === 2 ? 'ليلتان' : 'ليالي'}`}
                  </span>
                </div>
              )}

              <div className="offer-booking-card__price">
                <span className="offer-booking-card__price-label">يبدأ من</span>
                <div className="offer-booking-card__price-value">
                  <span className="offer-booking-card__price-amount">{offer.price.toLocaleString()}</span>
                  <span className="offer-booking-card__price-currency">{offer.currency}</span>
                </div>
              </div>

              {offer.priceTiers?.length > 0 && (
                <div className="offer-price-tiers">
                  <h4>الأسعار حسب الفئة</h4>
                  {offer.priceTiers.map((tier, idx) => (
                    <div key={idx} className="offer-price-tier">
                      <span>{tier.label}</span>
                      <span>{tier.price.toLocaleString()} {tier.currency}</span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href={`https://wa.me/${offer.whatsappNumber || '966503673733'}?text=${whatsappMessage}`}
                className="btn btn-whatsapp btn-lg offer-booking-card__cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                احجز عبر واتساب
              </a>

              <p className="offer-booking-card__note">
                أو اتصل بنا مباشرة للاستفسار
              </p>
            </div>

            {/* Tags */}
            {offer.tags?.length > 0 && (
              <div className="offer-tags-card">
                <h4>🏷️ الوسوم</h4>
                <div className="offer-tags">
                  {offer.tags.map((tag) => (
                    <span key={tag.id} className="offer-tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Offers */}
        {offer.related?.length > 0 && (
          <section className="related-offers">
            <h2 className="section-title">عروض مشابهة</h2>
            <div className="related-offers__grid">
              {offer.related.map((related) => (
                <Link key={related.id} to={`/offers/${related.slug}`} className="related-offer-card card">
                  <div className="card-image">
                    {related.coverImageUrl ? (
                      <LazyImage src={related.coverImageUrl} alt={related.title} />
                    ) : (
                      <div className="card-image__placeholder">
                        <span>🖼️</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{related.title}</h3>
                    <div className="related-offer-card__price">
                      <span>{related.price.toLocaleString()}</span>
                      <span>{related.currency}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
