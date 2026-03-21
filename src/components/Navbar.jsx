import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [language, setLanguage] = useState(() => {
    // Leer cookie al inicializar
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const savedLang = getCookie('language');
    return savedLang || 'es'; // español por defecto
  });
  
  const menuRef = useRef(null);

  // Guardar idioma en cookie cuando cambie
  useEffect(() => {
    document.cookie = `language=${language}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 año
  }, [language]);

  // Controlar visibilidad del navbar basado en el scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Solo aplicar si el menú no está abierto
      if (!menuOpen) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          // Scroll hacia abajo - ocultar navbar
          setVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scroll hacia arriba - mostrar navbar
          setVisible(true);
        }
      }
      
      // Actualizar estado de scrolled para cambiar estilos
      setScrolled(currentScrollY > 30);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, menuOpen]);

  // cerrar con Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // click fuera para cerrar
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  // bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  // Textos según idioma
  const translations = {
    es: {
      proyectos: "PROYECTOS",
      nosotros: "ESTUDIO",
      contacto: "CONTACTO",
      espanol: "ES",
      ingles: "EN"
    },
    en: {
      proyectos: "PROJECTS",
      nosotros: "STUDIO",
      contacto: "CONTACT",
      espanol: "ES",
      ingles: "EN"
    }
  };

  const t = translations[language];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${!visible ? 'navbar--hidden' : ''}`}>
        <div className="navbar__container">
          {/* LOGO a la izquierda */}
          <div className="navbar__logo">
            <Link to="/" className="navbar__logo-link" onClick={() => setMenuOpen(false)}>
              <span className="navbar__logo-text">HE RO A</span>
            </Link>
          </div>

          {/* TOGGLE (hamburguesa) - visible en todos los tamaños */}
          <button
            className={`navbar__toggle ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((s) => !s)}
          >
            <span className={`hamburger ${menuOpen ? 'is-active' : ''}`} />
          </button>
        </div>
      </nav>

      {/* MENU LATERAL (drawer) - igual para móvil y desktop */}
      <div
        ref={menuRef}
        className={`side-menu ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="side-menu__header">
          <button
            className="side-menu__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        
        <nav className="side-menu__nav">
          <div className="side-menu__language-selector">
            <button
              className={`side-menu__lang-btn ${language === 'es' ? 'active' : ''}`}
              onClick={() => {
                handleLanguageChange('es');
                setMenuOpen(false);
              }}
            >
              {t.espanol}
            </button>
            <button
              className={`side-menu__lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => {
                handleLanguageChange('en');
                setMenuOpen(false);
              }}
            >
              {t.ingles}
            </button>
          </div>
          <Link to="/proyectos" className="side-menu__link" onClick={() => setMenuOpen(false)}>
            {t.proyectos}
          </Link>
          <Link to="/nosotros" className="side-menu__link" onClick={() => setMenuOpen(false)}>
            {t.nosotros}
          </Link>
          <Link to="/contacto" className="side-menu__link" onClick={() => setMenuOpen(false)}>
            {t.contacto}
          </Link>
        </nav>
      </div>

      {/* BACKDROP */}
      <div
        className={`side-menu__backdrop ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
    </>
  );
};

export default Navbar;