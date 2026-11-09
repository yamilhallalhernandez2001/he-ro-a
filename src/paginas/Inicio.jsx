// paginas/Inicio.jsx — solo el nombre y el menú; el pie es el mismo de todas las páginas
import { useLayoutEffect, useRef } from 'react';
import { Menu } from '../componentes/Cabecera';
import Pie from '../componentes/Pie';
import { guardarOrigen, tomarOrigen } from '../lib/transicion';
import { ajustarNombre } from '../lib/optica';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Inicio() {
  const centro = useRef(null);
  // al elegir una sección, guarda la posición del nombre para la transición
  const alSalir = () => guardarOrigen(centro.current.getBoundingClientRect().top);

  // al volver desde otra página, el nombre y el menú bajan desde la cabecera al centro
  useLayoutEffect(() => {
    const nombre = centro.current.querySelector('.inicio__nombre');
    const ajustar = () => ajustarNombre(nombre);
    ajustar(); addEventListener('resize', ajustar);
    return () => removeEventListener('resize', ajustar);
  }, []);

  useLayoutEffect(() => {
    const origen = tomarOrigen();
    if (origen === null || REDUCED) return;
    const el = centro.current;
    el.style.transition = 'none';
    el.style.transform = `translateY(${origen - el.getBoundingClientRect().top}px)`;
    el.getBoundingClientRect();
    el.style.transition = 'transform .75s cubic-bezier(.7,0,.2,1)';
    el.style.transform = 'translateY(0)';
  }, []);
  return (
    <main className="inicio">
      <div className="inicio__centro" ref={centro} onClickCapture={alSalir}>
        <h1 className="inicio__nombre" aria-label="HE RO A">
          <span>HE</span><span>RO</span><span>A</span>
        </h1>
        <Menu />
      </div>
      <Pie />
    </main>
  );
}
