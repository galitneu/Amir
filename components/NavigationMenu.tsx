import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../helpers/useAuth';
import { LanguageSwitch } from './LanguageSwitch';
import styles from './NavigationMenu.module.css';

const getNavLinks = (t: any, isEnglish: boolean) => {
  if (isEnglish) {
    // Simplified English navigation
    return [
      { to: '/en/home', label: t('nav.home') },
      { to: '/en/biography', label: t('nav.biography') },
      { to: '/en/photos', label: t('nav.photos') },
      { to: '/en/stories', label: t('nav.stories') },
    ];
  } else {
    // Full Hebrew navigation
    return [
      { to: '/', label: t('nav.home') },
      { to: '/biography', label: t('nav.biography') },
      { to: '/photos', label: t('nav.photos') },
      { to: '/tributes', label: t('nav.tributes') },
      { to: '/stories', label: t('nav.stories') },
      { to: '/commemoration', label: t('nav.commemoration') },
      { to: '/acknowledgments', label: t('nav.acknowledgments') },
    ];
  }
};

export const NavigationMenu = ({ className }: { className?: string }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { authState } = useAuth();
  const { t, i18n } = useTranslation();
  
  const isAdmin = authState.type === 'authenticated' && authState.user.role === 'admin';
  const isEnglish = location.pathname.startsWith('/en');
  const navLinks = getNavLinks(t, isEnglish);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    
    // Update i18n language based on path
    const shouldBeEnglish = location.pathname.startsWith('/en');
    const currentLanguage = i18n.language;
    
    if (shouldBeEnglish && !currentLanguage.startsWith('en')) {
      i18n.changeLanguage('en');
    } else if (!shouldBeEnglish && currentLanguage.startsWith('en')) {
      i18n.changeLanguage('he');
    }
  }, [location, i18n]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ''}`;

  return (
    <header 
      key={i18n.language} 
      className={`${styles.header} ${isEnglish ? styles.english : styles.hebrew} ${className || ''}`}
    >
      <div className={styles.container}>
        <Link to={isEnglish ? "/en/home" : "/"} className={styles.logo}>
          {isEnglish ? "In Memory of Amir Neufeld" : "לזכרו של אמיר נויפלד"}
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={`${navLinkClass} ${styles.adminLink}`}>
              {t('nav.admin')}
            </NavLink>
          )}
          <LanguageSwitch />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className={styles.mobileControls}>
          <LanguageSwitch className={styles.mobileLanguageSwitch} />
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={isEnglish ? "Open menu" : "פתח תפריט"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNavOverlay} onClick={toggleMobileMenu}>
          <nav
            className={styles.mobileNav}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileNavHeader}>
                <span className={styles.mobileNavTitle}>{t('nav.menu')}</span>
                <button
                    className={styles.mobileMenuButton}
                    onClick={toggleMobileMenu}
                    aria-label={isEnglish ? "Close menu" : "סגור תפריט"}
                >
                    <X size={24} />
                </button>
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={toggleMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={`${navLinkClass} ${styles.adminLink}`}
                onClick={toggleMobileMenu}
              >
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};