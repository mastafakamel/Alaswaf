import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'الرئيسية' },
        { to: '/offers', label: 'العروض' },
        { to: '/blog', label: 'المدونة' },
        { to: '/branches', label: 'الفروع' },
        { to: '/about', label: 'من نحن' },
    ];

    return (
        <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
            <div className="container">
                <div className="header__inner">
                    {/* Logo */}
                    <Link to="/" className="header__logo">
                        <img src="/images/logo.png" alt="الأسواف للسياحة" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header__nav hide-mobile">
                        <ul className="header__nav-list">
                            {navLinks.map((link) => (
                                <li key={link.to}>
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* CTA Button */}
                    <div className="header__actions hide-mobile">
                        <Link to="/branches" className="btn btn-accent">
                            تواصل معنا
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="header__menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="قائمة التنقل"
                    >
                        <span className={`hamburger ${isMenuOpen ? 'hamburger--open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`header__mobile-menu ${isMenuOpen ? 'header__mobile-menu--open' : ''}`}>
                <nav className="header__mobile-nav">
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `header__mobile-link ${isActive ? 'header__mobile-link--active' : ''}`
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <Link
                        to="/branches"
                        className="btn btn-accent btn-lg"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        تواصل معنا
                    </Link>
                </nav>
            </div>
        </header>
    );
}
