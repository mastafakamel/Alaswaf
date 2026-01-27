import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Mail, Phone, Clock, MapPin, Send, Instagram, Twitter, Youtube, Facebook } from 'lucide-react';
import { branchesApi, offersApi } from '../../api/client';
import './Footer.css';

export default function Footer() {
    const [branches, setBranches] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        branchesApi.list().then((res) => setBranches(res.items || [])).catch(() => { });
        offersApi.categories().then((res) => setCategories(res || [])).catch(() => { });
    }, []);

    const dynamicLinks = categories.slice(0, 4).map(cat => ({
        to: `/offers?category=${cat.slug}`,
        label: `عروض ${cat.name}`,
        icon: cat.icon
    }));

    const quickLinks = [
        { to: '/', label: 'الرئيسية' },
        ...dynamicLinks,
        { to: '/blog', label: 'المدونة' },
        { to: '/about', label: 'من نحن' },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__main">
                <div className="container">
                    <div className="footer__grid">
                        {/* Brand Section */}
                        <div className="footer__section footer__brand">
                            <Link to="/" className="footer__logo">
                                <img src="/images/logo.png" alt="الأسواف للسياحة" />
                            </Link>
                            <p className="footer__description">
                                الأسواف للسياحة والسفر - شريكك الموثوق لرحلات العمرة والحج وتذاكر الطيران. نلتزم بتقديم أعلى مستويات الخدمة لضيوف الرحمن.
                            </p>
                        </div>

                        {/* Branches Section */}
                        <div className="footer__section footer__branches-container">
                            <h3 className="footer__title">فروعنا</h3>
                            <div className="footer__branches">
                                {branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <div key={branch.id} className="footer__branch-box">
                                            <div className="footer__branch-header">
                                                {branch.mapUrl ? (
                                                    <a
                                                        href={branch.mapUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="footer__branch-name-link"
                                                    >
                                                        <h4 className="footer__branch-name">
                                                            <MapPin size={16} />
                                                            {branch.label}
                                                        </h4>
                                                    </a>
                                                ) : (
                                                    <h4 className="footer__branch-name">
                                                        <MapPin size={16} />
                                                        {branch.label}
                                                    </h4>
                                                )}
                                            </div>
                                            <div className="footer__branch-details">
                                                {branch.phones?.slice(0, 2).map((p, idx) => (
                                                    <a key={idx} href={`tel:${p.phone}`} className="footer__branch-link">
                                                        <Phone size={14} />
                                                        <span dir="ltr">{p.phone}</span>
                                                    </a>
                                                ))}
                                                <a
                                                    href={`https://wa.me/${branch.whatsappE164?.replace('+', '')}`}
                                                    className="footer__branch-link whatsapp"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    تواصل واتساب
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="footer__text-muted">جاري تحميل الفروع...</p>
                                )}
                            </div>
                        </div>

                        <div className="footer__section footer__contact-column">
                            <h3 className="footer__title">تواصل معنا</h3>
                            <div className="footer__contact-info">
                                <a href="mailto:info@alaswaf.com" className="footer__contact-item">
                                    <Mail size={16} />
                                    info@alaswaf.com
                                </a>
                                <div className="footer__contact-item">
                                    <Clock size={16} />
                                    <span>السبت - الخميس: 9 ص - 9 م</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer__bottom">
                <div className="container">
                    <div className="footer__bottom-content">
                        <div className="footer__social-row">
                            <a href="https://www.facebook.com/aswafco/" target="_blank" rel="noopener noreferrer" className="footer__social-icon fb" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="https://x.com/aswafco" target="_blank" rel="noopener noreferrer" className="footer__social-icon x" aria-label="X">
                                <Twitter size={20} />
                            </a>
                            <a href="https://www.instagram.com/aswafco/" target="_blank" rel="noopener noreferrer" className="footer__social-icon ig" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                        </div>
                        <p className="footer__copy">
                            Copyright {currentYear} ©
                            <strong> مؤسسة الأسواف السياحية لتنظيم الرحلات</strong>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
