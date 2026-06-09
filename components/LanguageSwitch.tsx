import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import styles from './LanguageSwitch.module.css';

export const LanguageSwitch = ({ className }: { className?: string }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = i18n.language.startsWith('en') ? 'en' : 'he';
  const otherLang = currentLang === 'en' ? 'he' : 'en';

  const handleLanguageChange = () => {
    const newLang = otherLang;
    
    // Change the language
    i18n.changeLanguage(newLang);

    // Always navigate to homepage in the target language
    const newPath = newLang === 'en' ? '/en/home' : '/';
    navigate(newPath);
  };

  return (
    <button
      onClick={handleLanguageChange}
      className={`${styles.switchButton} ${className || ''}`}
      aria-label={`Switch to ${otherLang === 'he' ? 'Hebrew' : 'English'}`}
    >
      <Globe size={16} />
      <span>
        {otherLang === 'he' ? t('language.switchToHebrew') : t('language.switchToEnglish')}
      </span>
    </button>
  );
};