import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { blogApi } from '../api/client';
import SEO from '../components/layout/SEO';
import LazyImage from '../components/common/LazyImage';
import './BlogPost.css';

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await blogApi.getBySlug(slug);
                setPost(res);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <main className="blog-post-page">
                <div className="loading-overlay" style={{ minHeight: '60vh' }}>
                    <span className="loader"></span>
                    <span>جاري تحميل المقال...</span>
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="blog-post-page">
                <div className="container">
                    <div className="error-state">
                        <h2>عذراً، لم نتمكن من العثور على هذا المقال</h2>
                        <p>{error || 'المقال غير موجود أو تم حذفه'}</p>
                        <Link to="/blog" className="btn btn-primary">
                            العودة للمدونة
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="blog-post-page">
            <SEO
                title={post.title}
                description={post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160)}
                ogImage={post.coverImageUrl}
                ogType="article"
                keywords={`${post.title}, مدونة الأسواف, نصائح السفر`}
            />
            {/* Hero */}
            <section className="blog-post-hero">
                {post.coverImageUrl && (
                    <div className="blog-post-hero__image">
                        <LazyImage src={post.coverImageUrl} alt={post.title} />
                        <div className="blog-post-hero__overlay"></div>
                    </div>
                )}
                <div className="container">
                    <div className="blog-post-hero__content">
                        <nav className="breadcrumb">
                            <Link to="/">الرئيسية</Link>
                            <span>/</span>
                            <Link to="/blog">المدونة</Link>
                            <span>/</span>
                            <span>{post.title}</span>
                        </nav>
                        <h1 className="blog-post-hero__title">{post.title}</h1>
                        <div className="blog-post-hero__meta">
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
                                    <span>بواسطة {post.authorName}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="container">
                <article className="blog-post-content">
                    {post.excerpt && (
                        <p className="blog-post-content__excerpt">{post.excerpt}</p>
                    )}
                    <div
                        className="blog-post-content__body"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                {/* Share */}
                <div className="blog-post-share">
                    <span>شارك المقال:</span>
                    <div className="blog-post-share__links">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${window.location.href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="blog-post-share__link"
                            aria-label="Share on Twitter"
                        >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="blog-post-share__link"
                            aria-label="Share on Facebook"
                        >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="blog-post-share__link blog-post-share__link--whatsapp"
                            aria-label="Share on WhatsApp"
                            style={{ backgroundColor: 'var(--color-whatsapp)', color: 'white' }}
                        >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Back to Blog */}
                <div className="blog-post-nav">
                    <Link to="/blog" className="btn btn-outline">
                        ← العودة للمدونة
                    </Link>
                </div>
            </div>
        </main>
    );
}
