// lib/idioma.jsx — idioma ES / EN (se guarda en la cookie "language", igual que antes)
import { createContext, useContext, useEffect, useState } from 'react';
import estudio from '../contenido/estudio.json';

const read = () => {
  try {
    const m = document.cookie.match(/(?:^|; )language=(es|en)/);
    return m ? m[1] : 'es';
  } catch { return 'es'; }
};

const LangCtx = createContext({ lang: 'es', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(read);
  useEffect(() => {
    try { document.cookie = `language=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`; } catch { /* sin cookies */ }
    document.documentElement.lang = lang;
    // la descripción de la página (buscadores, vistas previas) en el idioma elegido
    const texto = estudio.texto && estudio.texto[lang];
    if (texto) document.querySelectorAll('meta[name="description"], meta[property="og:description"]').forEach((m) => m.setAttribute('content', texto));
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

// Textos de interfaz
export const UI = {
  es: {
    archivo: 'Archivo', estudio: 'Estudio', contacto: 'Contacto',
    ubicacion: 'Ubicación', fecha: 'Fecha', tipologia: 'Tipología', area: 'Área', estatus: 'Estatus',
    registro: 'Registro', publicaciones: 'Publicaciones', equipo: 'Equipo', direccion: 'Dirección', anterior: 'Anterior', siguiente: 'Siguiente',
    cerrar: 'Cerrar',
  },
  en: {
    archivo: 'Archive', estudio: 'Studio', contacto: 'Contact',
    ubicacion: 'Location', fecha: 'Date', tipologia: 'Typology', area: 'Area', estatus: 'Status',
    registro: 'Record', publicaciones: 'Publications', equipo: 'Team', direccion: 'Address', anterior: 'Previous', siguiente: 'Next',
    cerrar: 'Close',
  },
};
export const useUI = () => UI[useLang().lang];

// Devuelve el texto en el idioma actual: elegir({ es, en }, lang) o un texto simple
export const elegir = (valor, lang) => (valor && typeof valor === 'object' ? valor[lang] : valor);
