// paginas/Archivo.jsx — EL CAMPO DEL ARCHIVO
// Registros (fotos y planos) de todas las entradas, mezclados y repartidos en el rectángulo libre
// de la pantalla. Se abren desde el centro al entrar y luego quedan completamente quietos.
// · Pasa el cursor por un registro o un nombre: su entrada se queda, lo demás se apaga.
// · Clic en un registro: se abre la entrada justo en ese registro.
// · Siempre muestra el mismo número de piezas (TOTAL_EN_CAMPO), repartidas entre
//   entradas y elegidas al azar en cada visita (ver lib/campo.js).
import { useEffect, useMemo, useRef, useState } from 'react';
import { ENTRADAS, CATEGORIAS, TOTAL_EN_CAMPO } from '../contenido/archivo/index.js';
import { elegirPiezas } from '../lib/campo';
import Cabecera from '../componentes/Cabecera';
import Pie from '../componentes/Pie';
import { Link, useRouter } from '../lib/router';
import { useLang, elegir } from '../lib/idioma';
import { fijarFoco } from '../lib/foco';
import { medirTodas } from '../lib/proporciones';
import { usePasos } from '../lib/pasos';
import { cuandoLlegue } from '../lib/llegada';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const barajar = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function azar(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export default function Archivo() {
  const { lang } = useLang();
  const { navigate } = useRouter();
  const [activo, setActivo] = useState(null);       // índice de la entrada bajo el cursor
  const [proporciones, setProporciones] = useState(null);
  const campoRef = useRef(null);
  const els = useRef([]);
  usePasos();

  // En cada visita: nueva selección de registros (y de entradas, si son muchas)
  const piezas = useMemo(() => barajar(elegirPiezas(ENTRADAS, TOTAL_EN_CAMPO))
    .map((pz) => ({ ...pz, pi: ENTRADAS.indexOf(pz.entrada), slug: pz.entrada.slug })), []);

  // 1. medir todas las imágenes; 2. componer; 3. abrir desde el centro
  useEffect(() => { medirTodas(piezas.map((p) => p.src)).then(setProporciones); }, [piezas]);

  useEffect(() => {
    if (!proporciones) return;
    const campo = campoRef.current, N = piezas.length;
    const semilla = Math.floor(Math.random() * 1e9);   // un acomodo nuevo en cada visita, fijo mientras estás en la página
    const st = piezas.map((_, i) => ({ r: proporciones[i], w: 0, h: 0 }));
    let L = { W: 0, H: 0 }, destino = [];

    // Los registros se reparten libremente en todo el rectángulo libre del campo
    // (horizontal en computadora, vertical en teléfono). Cada pieza se coloca donde
    // queda más lejos de las ya colocadas (muestreo por mejor candidato): el área se
    // llena de forma pareja, sin retícula ni líneas vacías.
    const medidas = () => {
      const W = campo.clientWidth, H = campo.clientHeight;
      const css = getComputedStyle(document.documentElement);
      const mx = parseFloat(css.getPropertyValue('--margen')) || 40, my = 12;
      L = { W, H, mx, my };
      const u = Math.max(34, Math.sqrt(((W - 2 * mx) * (H - 2 * my)) / N) * 0.52);
      st.forEach((s, i) => {
        const k = piezas[i].tipo === 'dibujo' ? 1.1 : 0.9;
        s.w = Math.round(u * Math.sqrt(s.r) * k); s.h = Math.round((u / Math.sqrt(s.r)) * k);
        const el = els.current[i];
        if (el) { el.style.width = s.w + 'px'; el.style.height = s.h + 'px'; }
      });
      destino = componer();
    };

    const componer = () => {
      const r = azar(semilla), { W, H, mx, my } = L;
      const puestos = [];
      // separación entre dos rectángulos (negativa si se enciman)
      const hueco = (a, b) => Math.max(Math.abs(a.x - b.x) - (a.w + b.w) / 2, Math.abs(a.y - b.y) - (a.h + b.h) / 2);
      const orden = piezas.map((_, i) => i).sort((a, b) => st[b].w * st[b].h - st[a].w * st[a].h); // grandes primero
      const out = new Array(N);
      orden.forEach((i) => {
        const s = st[i];
        let mejor = null, mejorD = -Infinity;
        for (let c = 0; c < 60; c++) {
          const p = {
            x: mx + s.w / 2 + r() * Math.max(0, W - 2 * mx - s.w),
            y: my + s.h / 2 + r() * Math.max(0, H - 2 * my - s.h), w: s.w, h: s.h,
          };
          // distancia a la pieza más cercana y a los bordes (los bordes cuentan menos)
          let d = Math.min(p.x - s.w / 2 - mx, W - mx - p.x - s.w / 2, p.y - s.h / 2 - my, H - my - p.y - s.h / 2) * 2 + 40;
          for (const q of puestos) d = Math.min(d, hueco(p, q));
          if (d > mejorD) { mejorD = d; mejor = p; }
        }
        puestos.push(mejor);
        out[i] = { x: mejor.x - W / 2, y: mejor.y - H / 2 };   // relativo al centro del campo
      });
      return out;
    };

    // Aparición: cada registro se revela en su lugar, sin moverse, con un leve
    // desfase entre unos y otros (orden al azar).
    let raf;
    const colocar = () => piezas.forEach((_, i) => {
      const el = els.current[i]; if (!el) return;
      const s = st[i];
      const x = Math.round(L.W / 2 + destino[i].x - s.w / 2), y = Math.round(L.H / 2 + destino[i].y - s.h / 2);
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    const revelar = () => {
      if (REDUCED) { els.current.forEach((el) => el && (el.style.opacity = '')); return; }
      const orden = barajar(piezas.map((_, i) => i));
      orden.forEach((i, n) => {
        const el = els.current[i]; if (!el) return;
        el.style.transition = `opacity 1.1s ease ${250 + n * 70}ms`;
        el.style.opacity = '1';
      });
      setTimeout(() => els.current.forEach((el) => { if (el) { el.style.transition = ''; el.style.opacity = ''; } }), 1400 + N * 70);
    };
    const dibujar = () => colocar();
    let abierto = true;

    // solo se recompone si cambia de verdad el tamaño (no por la barra del navegador del teléfono)
    let antes = { W: 0, H: 0 };
    const alCambiar = () => {
      const W = campo.clientWidth, H = campo.clientHeight;
      if (W === antes.W && Math.abs(H - antes.H) < 120) return;
      antes = { W, H }; medidas(); if (abierto) dibujar();
    };

    medidas(); antes = { W: L.W, H: L.H };
    colocar();
    // decodificar las imágenes mientras sube el nombre: al aparecer ya están listas y nada se traba
    const listas = Promise.all(els.current.map((el) => {
      const img = el && el.querySelector('img');
      return img && img.decode ? img.decode().catch(() => {}) : null;
    }));
    cuandoLlegue(() => listas.then(() => { if (abierto) raf = requestAnimationFrame(revelar); }));   // después de que sube el nombre
    addEventListener('resize', alCambiar);
    return () => { abierto = false; cancelAnimationFrame(raf); removeEventListener('resize', alCambiar); };
  }, [proporciones, piezas]);

  // Clic: se abre la entrada en ese registro. Una copia sale desde su lugar en el campo
  // y crece hasta su lugar en la entrada (lo termina paginas/Entrada.jsx).
  const abrir = (i) => {
    const pz = piezas[i], ruta = '/archivo/' + pz.slug;
    const el = els.current[i];
    let copia = null;
    if (!REDUCED && el) {
      const a = el.getBoundingClientRect();
      copia = document.createElement('div');
      copia.className = 'vuelo' + (pz.tipo === 'dibujo' ? ' vuelo--dibujo' : '');
      copia.innerHTML = `<img src="${pz.src}" alt="">`;
      Object.assign(copia.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
      document.body.appendChild(copia);
    }
    fijarFoco(pz.slug, pz.indice, copia);
    navigate(ruta);
  };

  return (
    <main className="pagina archivo aparecer">
      <Cabecera />

      {/* Pantalla 1: el campo ocupa todo el espacio bajo el menú */}
      <section className="paso archivo__campo">
      <div className={'campo' + (activo !== null ? ' is-hover' : '')} ref={campoRef}>
        {proporciones && piezas.map((pz, i) => (
          <button
            key={i}
            ref={(el) => (els.current[i] = el)}
            className={'campo__pieza campo__pieza--' + pz.tipo + (activo === pz.pi ? ' is-activo' : '')}
            style={{ opacity: 0 }}
            onMouseEnter={() => setActivo(pz.pi)}
            onMouseLeave={() => setActivo(null)}
            onFocus={() => setActivo(pz.pi)}
            onBlur={() => setActivo(null)}
            onClick={() => abrir(i)}
            aria-label={elegir(ENTRADAS[pz.pi].nombre, lang)}
          >
            <img src={pz.src} alt="" draggable="false" />
          </button>
        ))}
      </div>

      </section>

      {/* Pantalla 2: el índice escrito — categoría (mitad izquierda) | entradas (mitad derecha).
          Al pasar el cursor por una entrada o sus registros, quedan resaltadas ella y su
          categoría; lo demás baja de opacidad. */}
      <section className="paso archivo__indice" data-completa="1">
      <dl className="indice filas">
        {CATEGORIAS.map((cat) => (
          <div key={cat.id}>
            <dt className={'titulo' + (activo !== null && ENTRADAS[activo].categoria.id !== cat.id ? ' is-apagado' : '')}>{elegir(cat.nombre, lang)}</dt>
            <dd className="indice__entradas">
              {cat.entradas.map((e) => {
                const pi = ENTRADAS.findIndex((x) => x.slug === e.slug), p = ENTRADAS[pi];
                return (
                  <Link
                    key={p.slug}
                    to={'/archivo/' + p.slug}
                    className={'indice__entrada' + (activo !== null && activo !== pi ? ' is-apagado' : '')}
                    onMouseEnter={() => setActivo(pi)}
                    onMouseLeave={() => setActivo(null)}
                  >
                    <span className="titulo">{elegir(p.nombre, lang)}</span>
                    <span>{[elegir(p.ficha?.tipologia, lang), p.ficha?.fecha].filter(Boolean).join(', ')}</span>
                  </Link>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
      <Pie />
      </section>
    </main>
  );
}
