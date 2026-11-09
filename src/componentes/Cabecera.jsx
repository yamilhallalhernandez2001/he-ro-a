// componentes/Cabecera.jsx — el nombre HE RO A al mismo tamaño que en el inicio,
// con el menú debajo a la derecha. Igual en todas las páginas.
// Al llegar desde el inicio, el bloque sube desde el centro hasta arriba;
// al picar HE RO A, baja de nuevo al centro (ver paginas/Inicio.jsx).
import { useLayoutEffect, useRef } from 'react';
import { Link } from '../lib/router';
import { useUI } from '../lib/idioma';
import { tomarOrigen, guardarOrigen } from '../lib/transicion';
import { ajustarNombre } from '../lib/optica';
import { empezarLlegada, terminarLlegada } from '../lib/llegada';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Menu() {
  const t = useUI();
  return (
    <nav className="menu">
      <Link to="/archivo" data-t={t.archivo}>{t.archivo}</Link>
      <Link to="/estudio" data-t={t.estudio}>{t.estudio}</Link>
      <Link to="/contacto" data-t={t.contacto}>{t.contacto}</Link>
    </nav>
  );
}

export default function Cabecera() {
  const cab = useRef(null), bloque = useRef(null), letras = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    // mide la cabecera para que el contenido empiece justo debajo
    const medir = () => {
      ajustarNombre(letras.current);
      const h = cab.current.offsetHeight + 'px';
      root.style.setProperty('--cabecera', h);
    };
    medir();
    // Llegada desde el inicio: el bloque sube desde donde estaba
    const origen = tomarOrigen();
    if (origen !== null && !REDUCED) {
      const el = bloque.current;
      el.style.transition = 'none';
      el.style.transform = `translateY(${origen - el.getBoundingClientRect().top}px)`;
      el.getBoundingClientRect();
      el.style.transition = 'transform .75s cubic-bezier(.7,0,.2,1)';
      el.style.transform = 'translateY(0)';
      // el contenido de la página espera a que termine la subida
      empezarLlegada();
      const fin = () => { clearTimeout(t); el.removeEventListener('transitionend', fin); terminarLlegada(); };
      const t = setTimeout(fin, 820);
      el.addEventListener('transitionend', fin);
    }
    addEventListener('resize', medir);
    return () => removeEventListener('resize', medir);
  }, []);

  return (
    <header className="cabecera" ref={cab}>
      <div className="cabecera__bloque" ref={bloque}>
        <Link to="/" className="cabecera__nombre" aria-label="HE RO A"
          onClick={() => guardarOrigen(bloque.current.getBoundingClientRect().top)}>
          <span className="cabecera__letras" ref={letras}><span>HE</span><span>RO</span><span>A</span></span>
        </Link>
        <div className="cabecera__menu"><Menu /></div>
      </div>
    </header>
  );
}
