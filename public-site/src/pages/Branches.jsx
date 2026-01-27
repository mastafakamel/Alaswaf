import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { branchesApi, leadsApi } from '../api/client';
import './Branches.css';

export default function Branches() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await branchesApi.list();
                console.log('Branches API Response:', res);
                setBranches(res.items || []);
            } catch (error) {
                console.error('Error fetching branches:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);

        try {
            await leadsApi.create({
                ...formData,
                source: 'CONTACT',
            });
            setSubmitStatus('success');
            setFormData({ name: '', phone: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <main className="branches-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <nav className="breadcrumb">
                        <Link to="/">الرئيسية</Link>
                        <span>/</span>
                        <span>فروعنا</span>
                    </nav>
                    <h1 className="page-header__title">فروعنا ومعلومات التواصل</h1>
                    <p className="page-header__subtitle">
                        نحن بانتظاركم في فروعنا بالمملكة العربية السعودية
                    </p>
                </div>
            </section>

            <div className="container">
                {/* Branches List */}
                <section className="branches-list">
                    <h2 className="section-title text-center">مكاتبنا</h2>

                    {loading ? (
                        <div className="loading-overlay">
                            <span className="loader"></span>
                            <span>جاري تحميل الفروع...</span>
                        </div>
                    ) : branches.length > 0 ? (
                        <div className="branches-grid">
                            {branches.map((branch) => (
                                <div key={branch.id} className="branch-detail-card">
                                    <div className="branch-detail-card__header">
                                        <div className="branch-detail-card__icon">
                                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="branch-detail-card__title">
                                                {branch.label}
                                                {branch.city && <span className="branch-detail-card__city"> - {branch.city.name}</span>}
                                            </h3>
                                            {branch.address && (
                                                <p className="branch-detail-card__address">{branch.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phones */}
                                    {branch.phones?.length > 0 && (
                                        <div className="branch-detail-card__section">
                                            <h4>
                                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                                                </svg>
                                                أرقام الهاتف
                                            </h4>
                                            <ul className="branch-detail-card__phones">
                                                {branch.phones.map((phone) => (
                                                    <li key={phone.id}>
                                                        <a href={`tel:${phone.phone}`} dir="ltr">
                                                            {phone.phone}
                                                        </a>
                                                        {phone.label && <span>({phone.label})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="branch-detail-card__actions">
                                        <a
                                            href={`https://wa.me/${branch.whatsappE164?.replace('+', '')}`}
                                            className="btn btn-whatsapp"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            تواصل عبر واتساب
                                        </a>
                                        {branch.mapUrl && (
                                            <a
                                                href={branch.mapUrl}
                                                className="btn btn-outline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                </svg>
                                                عرض الموقع
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="branches-placeholder">
                            <div className="branches-grid">
                                <div className="branch-detail-card">
                                    <div className="branch-detail-card__header">
                                        <div className="branch-detail-card__icon">
                                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="branch-detail-card__title">فرع الرياض</h3>
                                            <p className="branch-detail-card__address">المملكة العربية السعودية - الرياض</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="branch-detail-card">
                                    <div className="branch-detail-card__header">
                                        <div className="branch-detail-card__icon">
                                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="branch-detail-card__title">فرع الدمام</h3>
                                            <p className="branch-detail-card__address">المملكة العربية السعودية - الدمام</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Contact Form */}
                <section className="contact-form-section">
                    <div className="contact-form-container">
                        <div className="contact-form-info">
                            <h2>تواصل معنا</h2>
                            <p>
                                هل لديك استفسار؟ أرسل لنا رسالتك وسنتواصل معك في أقرب وقت ممكن.
                            </p>
                            <div className="contact-form-features">
                                <div className="contact-form-feature">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <span>رد سريع خلال 24 ساعة</span>
                                </div>
                                <div className="contact-form-feature">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <span>فريق دعم متخصص</span>
                                </div>
                                <div className="contact-form-feature">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <span>استشارات مجانية</span>
                                </div>
                            </div>
                        </div>

                        <form className="contact-form" onSubmit={handleSubmit}>
                            {submitStatus === 'success' && (
                                <div className="contact-form__alert contact-form__alert--success">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="contact-form__alert contact-form__alert--error">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                    حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">الاسم</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="أدخل اسمك الكريم"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">رقم الجوال</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    placeholder="05XXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    dir="ltr"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">رسالتك</label>
                                <textarea
                                    name="message"
                                    className="form-input"
                                    placeholder="اكتب رسالتك أو استفسارك هنا..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg contact-form__submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loader loader-sm"></span>
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        إرسال الرسالة
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}
