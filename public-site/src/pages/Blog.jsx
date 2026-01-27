import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogApi } from '../api/client';
import SEO from '../components/layout/SEO';
import LazyImage from '../components/common/LazyImage';
import './Blog.css';

export default function Blog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0,
    });

    const page = parseInt(searchParams.get('page')) || 1;
    const q = searchParams.get('q') || '';

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = { page, limit: 9 };
                if (q) params.q = q;

                const res = await blogApi.list(params);
                setPosts(res.items || []);
                setPagination({
                    page: res.page,
                    limit: res.limit,
                    total: res.total,
                    totalPages: res.totalPages,
                });
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, q]);

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams();
        if (searchQuery.trim()) {
            newParams.set('q', searchQuery.trim());
        }
        setSearchParams(newParams);
    };

    const updatePage = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage);
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchParams({});
    };

    return (
        <main className="blog-page">
            <SEO
                title="المدونة"
                description="نصائح ومقالات مفيدة للمعتمرين والحجاج والمسافرين. دليلك الشامل لرحلة إيمانية ميسرة."
                keywords="مدونة السفر, نصائح العمرة, دليل الحج, الأسواف"
            />
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <nav className="breadcrumb">
                        <Link to="/">الرئيسية</Link>
                        <span>/</span>
                        <span>المدونة</span>
                    </nav>
                    <h1 className="page-header__title">مدونتنا</h1>
                    <p className="page-header__subtitle">
                        نصائح ومقالات مفيدة للمعتمرين والحجاج والمسافرين
                    </p>
                </div>
            </section>

            <div className="container">
                {/* Search Bar */}
                <div className="blog-search">
                    <form onSubmit={handleSearch} className="blog-search__form">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ابحث في المقالات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                            بحث
                        </button>
                    </form>
                    {q && (
                        <div className="blog-search__active">
                            <span>نتائج البحث عن: <strong>{q}</strong></span>
                            <button onClick={clearSearch}>مسح البحث</button>
                        </div>
                    )}
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="loading-overlay">
                        <span className="loader"></span>
                        <span>جاري تحميل المقالات...</span>
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        <div className="blog-grid">
                            {posts.map((post) => (
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
                                        <div className="blog-card__meta">
                                            <time>
                                                {new Date(post.publishedAt).toLocaleDateString('ar-SA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </time>
                                            {post.authorName && (
                                                <>
                                                    <span>•</span>
                                                    <span>{post.authorName}</span>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="card-title">{post.title}</h3>
                                        <p className="card-text">{post.excerpt}</p>
                                        <span className="blog-card__read-more">
                                            اقرأ المزيد →
                                        </span>
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
                                    onClick={() => updatePage(pagination.page - 1)}
                                >
                                    السابق
                                </button>
                                <div className="pagination__pages">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            className={`pagination__page ${p === pagination.page ? 'pagination__page--active' : ''}`}
                                            onClick={() => updatePage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="pagination__btn"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => updatePage(pagination.page + 1)}
                                >
                                    التالي
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state__icon">📝</div>
                        <h3>لا توجد مقالات</h3>
                        <p>{q ? 'لم نعثر على مقالات تطابق بحثك' : 'لا توجد مقالات منشورة حالياً'}</p>
                        {q && (
                            <button onClick={clearSearch} className="btn btn-primary">
                                عرض جميع المقالات
                            </button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
