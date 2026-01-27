import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { offersApi, citiesApi } from '../api/client';
import SEO from '../components/layout/SEO';
import LazyImage from '../components/common/LazyImage';
import { formatDateForCard } from '../utils/dateFormatter';
import { MapPin } from 'lucide-react';
import './Offers.css';

// Categories are now dynamic

// City labels are now dynamic

const sortOptions = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر: الأقل أولاً' },
  { value: 'price_desc', label: 'السعر: الأعلى أولاً' },
];

export default function Offers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Get filters from URL
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (category) params.category = category;
        if (city) params.city = city;

        const [offersRes, citiesRes, categoriesRes] = await Promise.all([
          offersApi.list(params),
          cities.length === 0 ? citiesApi.list() : Promise.resolve({ items: cities }),
          categories.length === 0 ? offersApi.categories() : Promise.resolve({ items: categories }),
        ]);

        const fetchedCities = citiesRes.items || [];
        setOffers(offersRes.items || []);
        if (cities.length === 0) setCities(fetchedCities);
        if (categories.length === 0) setCategories(categoriesRes || categoriesRes.items || []);

        // Default city selection logic
        if (!city && fetchedCities.length > 0) {
          const firstCitySlug = fetchedCities[0].slug;
          updateFilter('city', firstCitySlug);
        }

        setPagination({
          page: offersRes.page,
          limit: offersRes.limit,
          total: offersRes.total,
          totalPages: offersRes.totalPages,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, city, sort, page]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when changing filters
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (city) newParams.set('city', city);
    setSearchParams(newParams);
  };

  return (
    <main className="offers-page">
      <SEO
        title={category && categories.length > 0 ? `عروض ${categories.find(c => c.id === category || c.slug === category)?.name || ''} | الأسواف` : 'جميع عروض الحج والعمرة'}
        description={`اكتشف أفضل ${category && categories.length > 0 ? 'عروض ' + (categories.find(c => c.id === category || c.slug === category)?.name || '') : 'عروض الحج والعمرة والرحلات السياحية'}. أسعار تنافسية وخدمات متميزة.`}
        keywords="عمرة, حج, عروض سفر, رحلات سياحية"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>العروض</span>
          </nav>
          <h1 className="page-header__title">جميع العروض</h1>
          <p className="page-header__subtitle">
            اكتشف أفضل عروض العمرة والحج وتذاكر الطيران بأسعار تنافسية
          </p>
        </div>
      </section>

      <div className="container">
        <div className="offers-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-sidebar__header">
              <h3>تصفية النتائج</h3>
              {(category || city) && (
                <button onClick={clearFilters} className="filters-sidebar__clear">
                  مسح الكل
                </button>
              )}
            </div>

            {/* City Filter */}
            <div className="filter-group filter-group--prominent">
              <h4 className="filter-group__title">مدينة الانطلاق</h4>
              <div className="filter-options">
                {cities.map((c) => (
                  <button
                    key={c.id}
                    className={`filter-option ${city === c.id || city === c.slug ? 'filter-option--active' : ''}`}
                    onClick={() => updateFilter('city', c.slug)}
                  >
                    <MapPin size={16} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">التصنيف</h4>
              <div className="filter-options">
                <button
                  className={`filter-option ${!category ? 'filter-option--active' : ''}`}
                  onClick={() => updateFilter('category', '')}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`filter-option ${category === cat.id || category === cat.slug ? 'filter-option--active' : ''}`}
                    onClick={() => updateFilter('category', cat.slug)}
                  >
                    <span className="filter-option__icon">
                      {cat.icon?.startsWith('http') ? (
                        <img src={cat.icon} alt={cat.name} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      ) : (
                        cat.icon || '🕋'
                      )}
                    </span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="offers-content">
            {/* Sort & Results Count */}
            <div className="offers-toolbar">
              <div className="offers-toolbar__count">
                {loading ? 'جاري البحث...' : `${pagination.total} عرض`}
              </div>
              <div className="offers-toolbar__sort">
                <label>ترتيب حسب:</label>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="form-input"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Offers Grid */}
            {loading ? (
              <div className="loading-overlay">
                <span className="loader"></span>
                <span>جاري تحميل العروض...</span>
              </div>
            ) : offers.length > 0 ? (
              <>
                <div className="offers-grid">
                  {offers.map((offer) => (
                    <Link key={offer.id} to={`/offers/${offer.slug}`} className="offer-card card">
                      <div className="card-image">
                        {offer.coverImageUrl ? (
                          <LazyImage src={offer.coverImageUrl} alt={offer.title} />
                        ) : (
                          <div className="card-image__placeholder">
                            <span>
                              {offer.category?.icon?.startsWith('http') ? (
                                <img src={offer.category.icon} alt={offer.category.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                              ) : (
                                offer.category?.icon || '🕋'
                              )}
                            </span>
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
                            {offer.startDate
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination__btn"
                      disabled={pagination.page <= 1}
                      onClick={() => updateFilter('page', pagination.page - 1)}
                    >
                      السابق
                    </button>
                    <div className="pagination__pages">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`pagination__page ${p === pagination.page ? 'pagination__page--active' : ''}`}
                          onClick={() => updateFilter('page', p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      className="pagination__btn"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => updateFilter('page', pagination.page + 1)}
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>لا توجد عروض</h3>
                <p>لم نعثر على عروض تطابق معايير البحث</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  عرض جميع العروض
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
