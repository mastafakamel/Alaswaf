import { Link } from 'react-router-dom';
import './CTA.css';

export default function CTA() {
    return (
        <section className="cta-section">
            <div className="cta-section__background"></div>
            <div className="container">
                <div className="cta-section__content">
                    <h2 className="cta-section__title">
                        جاهز لحجز رحلتك القادمة؟
                    </h2>
                    <p className="cta-section__text">
                        تواصل معنا الآن واحصل على أفضل العروض والخدمات المميزة
                    </p>
                    <div className="cta-section__actions">
                        <Link to="/offers" className="btn btn-white btn-lg">
                            استعرض العروض
                        </Link>
                        <Link to="/branches" className="btn btn-lg cta-btn-outline">
                            تواصل معنا
                        </Link>
                    </div>
                </div>
            </div>

            {/* Curved Separator */}
            <div className="cta-section__separator">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                </svg>
            </div>
        </section>
    );
}
