// hooks/useLanguage.js
import { useState, useEffect } from 'react';

// Función para leer la cookie
const getLanguageCookie = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; language=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return 'es'; // español por defecto
};

export const useLanguage = () => {
  const [language, setLanguage] = useState(getLanguageCookie());

  useEffect(() => {
    // Escuchar cambios en la cookie (cuando Navbar la actualice)
    const checkCookieChange = () => {
      const newLang = getLanguageCookie();
      if (newLang !== language) {
        setLanguage(newLang);
      }
    };

    // Revisar cambios cada 100ms (alternativa ligera)
    const interval = setInterval(checkCookieChange, 100);

    // También escuchar un evento personalizado para cambios inmediatos
    const handleLanguageChange = (event) => {
      if (event.detail) {
        setLanguage(event.detail);
      }
    };
    window.addEventListener('languageChange', handleLanguageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, [language]);

  return language;
};