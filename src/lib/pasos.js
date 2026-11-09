// lib/pasos.js — "acomodo por pantallas".
// Cada sección .paso es una pantalla. Cualquier gesto —rueda, trackpad, dedo o teclado—
// lleva a la pantalla siguiente o anterior con un deslizamiento suave.
//
// Dos modos:
// · Archivo: campo → índice.
// · Entrada: ficha → primer registro → … → último registro → final (navegación y pie),
//   con el mismo movimiento que el Archivo, en ambos sentidos.
// · ({ libre: true }, sin uso por ahora): solo el carrusel va por pantallas; antes y
//   después el desplazamiento es libre.
//
// En el teléfono todo el movimiento lo hace este archivo (también el libre, con inercia),
// para que sea igual que en la computadora y no se trabe con la barra del navegador.
import { useEffect } from 'react';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const DURACION = 850;      // ms de cada deslizamiento
const PAUSA = 220;         // ms sin gestos para aceptar uno nuevo (absorbe la inercia del trackpad)
const UMBRAL = 12;         // px que debe recorrer el dedo para cambiar de pantalla

let controlador = null;

const cabecera = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cabecera')) || 0;
const maximo = () => document.documentElement.scrollHeight - innerHeight;

// posición de scroll que deja una pantalla justo debajo de la cabecera
// (una pantalla marcada data-completa ocupa toda la ventana, también detrás de la cabecera)
export const posicionDe = (el, esPrimera = false) =>
  esPrimera ? 0 : Math.min(maximo(), Math.round(el.getBoundingClientRect().top + scrollY - (el.dataset.completa ? 0 : cabecera())));

// ir a una pantalla con el mismo deslizamiento (miniaturas, enlaces internos)
export const irAPantalla = (el) => controlador && controlador.irA(el);

// Puntos de acomodo: el inicio de la página, cada pantalla .paso y el final de la página.
// (En una entrada: ficha → cada registro → navegación y pie.)
function puntosArchivo() {
  const els = [...document.querySelectorAll('.paso')];
  const base = [0, ...els.map((el) => Math.max(0, posicionDe(el))), maximo()];
  const ps = [...new Set(base)].sort((a, b) => a - b);
  const tramo = Math.max(200, innerHeight - cabecera() - 40);   // secciones más altas que la pantalla
  const out = [];
  ps.forEach((p, i) => {
    out.push(p);
    const sig = ps[i + 1];
    if (sig !== undefined && sig - p > innerHeight + 2) for (let y = p + tramo; y < sig - 40; y += tramo) out.push(y);
  });
  return out;
}
const puntosCarrusel = () => [...document.querySelectorAll('.paso')].map((el) => posicionDe(el));

export function usePasos({ libre = false } = {}) {
  useEffect(() => {
    let anim = null, ultimoGesto = 0, gestoLibre = false;
    const visorAbierto = () => !!document.querySelector('.visor');
    const puntos = libre ? puntosCarrusel : puntosArchivo;
    // zona: -1 antes del carrusel, 0 dentro, 1 después
    const zona = (y = scrollY) => {
      if (!libre) return 0;
      const ps = puntos();
      if (!ps.length) return -1;
      if (y < ps[0] - 2) return -1;
      if (y > ps[ps.length - 1] + 2) return 1;
      return 0;
    };

    const parar = () => { if (anim) cancelAnimationFrame(anim); anim = null; };
    const deslizar = (destino, dur = DURACION) => {
      parar();
      const inicio = scrollY, d = destino - inicio;
      if (Math.abs(d) < 1) return;
      if (REDUCED) { scrollTo(0, destino); return; }
      const t0 = performance.now();
      const paso = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        scrollTo(0, inicio + d * suave(k));
        anim = k < 1 ? requestAnimationFrame(paso) : null;
      };
      anim = requestAnimationFrame(paso);
    };
    // un paso por pantalla; devuelve false si toca salir del carrusel (desplazamiento libre)
    const mover = (dir) => {
      const ps = puntos(), y = scrollY;
      const destino = dir > 0 ? ps.find((p) => p > y + 2) : [...ps].reverse().find((p) => p < y - 2);
      if (destino === undefined) return false;
      deslizar(destino);
      return true;
    };
    // desplazamiento libre que se detiene en la orilla del carrusel
    const limites = () => {
      const ps = puntos(), max = maximo();
      if (!libre || !ps.length) return [0, max];
      return scrollY <= ps[0] + 2 ? [0, ps[0]] : [ps[ps.length - 1], max];
    };
    const libreHasta = (y) => { const [a, b] = limites(); return Math.max(a, Math.min(b, y)); };

    // ── rueda y trackpad ─────────────────────────────
    const alRodar = (e) => {
      if (visorAbierto() || e.ctrlKey) return;
      const now = performance.now(), quieto = now - ultimoGesto > PAUSA;
      ultimoGesto = now;
      const dir = Math.sign(e.deltaY);
      if (quieto && !anim) {
        const z = zona();
        // ¿este gesto es libre? (fuera del carrusel, o saliendo de él)
        gestoLibre = libre && (z !== 0 || (dir > 0 && scrollY >= puntos().at(-1) - 2) || (dir < 0 && scrollY <= puntos()[0] + 2));
        if (gestoLibre && z === 0) {
          // saliendo del carrusel: solo si hay a dónde ir
          const ps = puntos();
          if (dir > 0 && maximo() <= ps.at(-1) + 2) gestoLibre = false;
        }
      }
      if (gestoLibre) {
        // libre, pero sin cruzar hacia dentro del carrusel
        const destino = scrollY + e.deltaY * (e.deltaMode === 1 ? 16 : 1);
        const tope = libreHasta(destino);
        if (tope !== destino) {
          e.preventDefault();
          if (Math.abs(tope - scrollY) > 1 && !anim) deslizar(tope, 380);
          gestoLibre = false;            // el resto de la inercia se absorbe
          ultimoGesto = now;
        }
        return;
      }
      e.preventDefault();
      if (anim || !quieto || Math.abs(e.deltaY) < 2) return;
      mover(dir);
    };

    // ── dedo ─────────────────────────────────────────
    let t0y = null, ultY = 0, modo = null, usado = false, muestras = [], inercia = null;
    const pararInercia = () => { if (inercia) cancelAnimationFrame(inercia); inercia = null; };
    const alTocar = (e) => {
      if (visorAbierto()) return;
      pararInercia();
      t0y = ultY = e.touches[0].clientY; modo = null; usado = false; muestras = [];
    };
    const alArrastrar = (e) => {
      if (visorAbierto() || t0y === null) return;
      const yDedo = e.touches[0].clientY, dy = t0y - yDedo;
      e.preventDefault();
      if (modo === null) {
        if (Math.abs(dy) < 3) return;
        const dir = Math.sign(dy), z = zona(), ps = libre ? puntos() : [];
        const sale = libre && z === 0 && ((dir > 0 && scrollY >= ps.at(-1) - 2 && maximo() > ps.at(-1) + 2) || (dir < 0 && scrollY <= ps[0] + 2 && ps[0] > 2));
        modo = libre && (z !== 0 || sale) && !anim ? 'libre' : 'pasos';
      }
      if (modo === 'libre') {
        const d = ultY - yDedo;
        ultY = yDedo;
        scrollTo(0, libreHasta(scrollY + d));
        const t = performance.now();
        muestras.push([t, d]);
        muestras = muestras.filter(([ti]) => t - ti < 90);
        return;
      }
      if (!usado && !anim && Math.abs(dy) > UMBRAL) { usado = true; mover(Math.sign(dy)); }
    };
    const alSoltar = () => {
      if (modo === 'libre' && muestras.length > 1 && !REDUCED) {
        const dt = performance.now() - muestras[0][0] || 16;
        let v = muestras.reduce((s, [, d]) => s + d, 0) / dt * 16;   // px por cuadro
        const correr = () => {
          v *= 0.95;
          const y = scrollY, n = libreHasta(y + v);
          scrollTo(0, n);
          inercia = Math.abs(v) > 0.3 && n !== y && Math.abs(n - (y + v)) < 0.5 ? requestAnimationFrame(correr) : null;
        };
        inercia = requestAnimationFrame(correr);
      }
      t0y = null; modo = null;
    };

    // ── teclado ──────────────────────────────────────
    const alTeclear = (e) => {
      if (visorAbierto() || /input|textarea/i.test(e.target.tagName)) return;
      const k = e.key;
      const dir = ['ArrowDown', 'PageDown', ' '].includes(k) ? 1 : ['ArrowUp', 'PageUp'].includes(k) ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      if (anim) return;
      if (zona() !== 0 || !mover(dir)) {
        const salto = k.startsWith('Page') || k === ' ' ? innerHeight * 0.8 : 120;
        deslizar(libreHasta(scrollY + dir * salto), 380);
      }
    };

    // si la página se mueve por otro medio (barra de desplazamiento), acomodar al terminar
    let espera = null;
    const alScroll = () => {
      if (anim || inercia || t0y !== null) return;
      clearTimeout(espera);
      espera = setTimeout(() => {
        if (zona() !== 0) return;
        const ps = puntos(), y = scrollY;
        const cerca = ps.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a), ps[0]);
        if (Math.abs(cerca - y) > 2) deslizar(cerca);
      }, 200);
    };

    document.documentElement.classList.add('con-pasos');
    // si cambia el tamaño de la ventana (zoom, panel, girar el teléfono), volver a dejar
    // la pantalla actual exactamente en su lugar: nunca queda un pedazo de la anterior
    let ultimoPunto = null, esperaTam = null;
    const recordar = () => {
      if (zona() !== 0) { ultimoPunto = null; return; }
      const ps = puntos(), y = scrollY;
      ultimoPunto = ps.reduce((a, b, i) => (Math.abs(b - y) < Math.abs(ps[a] - y) ? i : a), 0);
    };
    const alCambiarTam = () => {
      clearTimeout(esperaTam);
      esperaTam = setTimeout(() => {
        if (anim || ultimoPunto === null) return;
        const ps = puntos();
        if (ps[ultimoPunto] !== undefined) scrollTo(0, ps[ultimoPunto]);
      }, 120);
    };
    const alScrollRecordar = () => { if (!anim) { clearTimeout(esperaRec); esperaRec = setTimeout(recordar, 100); } };
    let esperaRec = null;
    recordar();
    addEventListener('resize', alCambiarTam);
    addEventListener('scroll', alScrollRecordar, { passive: true });

    controlador = { irA: (el) => { pararInercia(); deslizar(Math.max(0, posicionDe(el))); } };
    addEventListener('wheel', alRodar, { passive: false });
    addEventListener('touchstart', alTocar, { passive: true });
    addEventListener('touchmove', alArrastrar, { passive: false });
    addEventListener('touchend', alSoltar, { passive: true });
    addEventListener('touchcancel', alSoltar, { passive: true });
    addEventListener('keydown', alTeclear);
    addEventListener('scroll', alScroll, { passive: true });
    return () => {
      parar(); pararInercia();
      clearTimeout(espera); clearTimeout(esperaTam); clearTimeout(esperaRec);
      removeEventListener('resize', alCambiarTam);
      removeEventListener('scroll', alScrollRecordar);
      controlador = null;
      document.documentElement.classList.remove('con-pasos');
      removeEventListener('wheel', alRodar);
      removeEventListener('touchstart', alTocar);
      removeEventListener('touchmove', alArrastrar);
      removeEventListener('touchend', alSoltar);
      removeEventListener('touchcancel', alSoltar);
      removeEventListener('keydown', alTeclear);
      removeEventListener('scroll', alScroll);
    };
  }, [libre]);
}
