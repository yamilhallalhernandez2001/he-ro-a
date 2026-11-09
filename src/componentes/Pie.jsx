// componentes/Pie.jsx — el mismo pie en todas las páginas, alineado con el nombre:
//   © 2026 HE RO A  bajo "HE"  ·  Instagram bajo "RO"  ·  ES / EN bajo "A" (a la derecha)
import { useLayoutEffect, useState } from 'react';
import { useLang } from '../lib/idioma';
import contacto from '../contenido/contacto.json';
import { fijarLineaRO } from '../lib/optica';

function SelectorIdioma() {
  const { lang, setLang } = useLang();
  return (
    <span className="idioma">
      <button data-t="ES" className={lang === 'es' ? 'is-active' : ''} onClick={() => setLang('es')}>ES</button>
      <span>/</span>
      <button data-t="EN" className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>EN</button>
    </span>
  );
}

export default function Pie() {
  const [xRO, setXRO] = useState(null);
  useLayoutEffect(() => {
    // posición horizontal de "RO" en el nombre (cabecera o inicio)
    const medir = () => {
      const ro = document.querySelector('.cabecera__letras > span:nth-child(2), .inicio__nombre > span:nth-child(2)');
      if (ro) setXRO(fijarLineaRO(ro));   // el trazo de la "R": la línea de la mitad derecha
    };
    medir();
    const cuadro = requestAnimationFrame(medir);   // otra vez, ya con el ajuste óptico del nombre aplicado
    addEventListener('resize', medir);
    return () => { cancelAnimationFrame(cuadro); removeEventListener('resize', medir); };
  }, []);
  return (
    <footer className="pie">
      <span>© 2026 HE RO A</span>
      <a className="pie__ro" style={xRO !== null ? { left: xRO } : undefined}
        href={contacto.instagram} target="_blank" rel="noreferrer">Instagram</a>
      <SelectorIdioma />
    </footer>
  );
}
