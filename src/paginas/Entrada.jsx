// paginas/Entrada.jsx — una entrada del archivo.
// Todo va por pantallas, con el mismo movimiento que el Archivo (lib/pasos.js):
//   1. Ficha (categoría, nombre, crédito, datos). Debajo asoma el primer registro, a su
//      tamaño real: si no cabe, la pantalla lo corta.
//   2. Carrusel: un registro por pantalla, centrado en su caja, con las miniaturas a la
//      izquierda y "Registro 03 / 16" fijo abajo.
//   3. Final: navegación ❮ ❯ y pie.
//   Cada gesto lleva a la pantalla siguiente o anterior, en ambos sentidos.
// Todos los registros empiezan en la línea de "RO" (alineados a la izquierda).
//
// UNA SOLA REGLA PARA TODOS LOS REGISTROS (imagen y dibujo), en todos los proyectos:
// · Cada pantalla del carrusel tiene la misma caja: de la línea de "RO" al trazo de la "A"
//   (en el teléfono, del trazo de la "H" al de la "A"), y del margen bajo el menú al rótulo.
// · La imagen crece hasta tocar el ancho o el alto de la caja (lo que llegue primero),
//   sin cortarse ni deformarse.
// · Se alinea a la izquierda y se centra de arriba abajo.
// No hay ajustes por proyecto: solo se suben los archivos (los dibujos, recortados justo a su borde).
import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ENTRADAS, buscarEntrada } from '../contenido/archivo/index.js';
import Cabecera from '../componentes/Cabecera';
import Pie from '../componentes/Pie';
import Visor from '../componentes/Visor';
import { Link } from '../lib/router';
import { useLang, useUI, elegir } from '../lib/idioma';
import { leerFoco, borrarFoco, tomarVuelo } from '../lib/foco';
import { medirTamano } from '../lib/proporciones';
import { usePasos, posicionDe, irAPantalla } from '../lib/pasos';
import { bordeDerechoA } from '../lib/optica';

const pad2 = (n) => String(n).padStart(2, '0');
const css = (v, def) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) || def;
// alto estable de la pantalla (no cambia cuando el navegador del teléfono esconde su barra)
const sondas = {};
const medirAlto = (u) => {
  if (!sondas[u]) { const d = document.createElement('div'); d.style.cssText = `position:fixed;top:0;height:100${u};width:0;visibility:hidden;pointer-events:none`; document.body.appendChild(d); sondas[u] = d; }
  return sondas[u].offsetHeight || innerHeight;
};
const altoPantalla = () => medirAlto('svh');                       // con las barras del navegador visibles
const extraBarras = () => Math.max(0, medirAlto('lvh') - medirAlto('svh'), innerHeight - medirAlto('svh'));  // lo que crece si se esconden
const MINI = 60;   // ancho de la columna de miniaturas
const HUECO_MINI = 10;

export default function Entrada({ clave }) {
  const { lang } = useLang();
  const t = useUI();
  const p = buscarEntrada(clave);
  const [visor, setVisor] = useState(null);
  const [tam, setTam] = useState(null);          // tamaño en pantalla de cada registro
  const [actual, setActual] = useState(0);
  const [enCarrusel, setEnCarrusel] = useState(false);
  const foco = useMemo(() => (p ? leerFoco(p.slug) : null), [p]);
  useEffect(() => { borrarFoco(); }, [p]);
  usePasos();

  const registros = useMemo(() => !p ? [] : p.registros.map((r) => ({
    src: r.src, lamina: r.lamina, capitulo: t.registro, alt: elegir(r.nombre, lang) || '', dibujo: r.tipo === 'dibujo',
  })), [p, lang, t]);
  // en el visor, el dibujo se ve completo (lámina original), no recortado
  const enGrande = useMemo(() => registros.map((r) => ({ ...r, src: r.lamina || r.src })), [registros]);
  const N = registros.length;

  const pantallas = useRef([]);      // pantalla de cada registro
  const imgs = useRef([]);

  // ── Tamaños ─────────────────────────────────────────
  const ultimaMedida = useRef('');
  const calcular = useCallback(async () => {
    if (!N) return;
    // ancho real de la mitad derecha (sin la barra de desplazamiento ni redondeos)
    const celda = document.querySelector('.registro__lugar');
    if (!celda) return;
    // de la línea de "RO" (o de la "H" en el teléfono) hasta el trazo de la "A": mismo margen a ambos lados
    const izq = celda.getBoundingClientRect().left, der = bordeDerechoA();
    const ancho = Math.round(der && der > izq + 100 ? Math.min(celda.clientWidth + 2, der - izq) : celda.clientWidth);
    const H = altoPantalla();
    const clave = ancho + 'x' + H;
    if (clave === ultimaMedida.current) return;     // la barra del navegador no cuenta
    ultimaMedida.current = clave;
    const nat = await Promise.all(registros.map((r) => medirTamano(r.src, { soloMedida: true })));
    const margen = css('--margen', 40), cab = css('--cabecera', 200), e2 = css('--e2', 56);
    const rotulo = css('--rotulo', 20);
    // caja: entre el margen bajo el menú y el rótulo de abajo
    const alto = Math.max(120, H - cab - 2 * margen - rotulo - e2);
    document.documentElement.style.setProperty('--caja', alto + 'px');
    const medidas = registros.map((r, k) => {
      const f = Math.min(ancho / nat[k].w, alto / nat[k].h);   // crece hasta tocar el ancho o el alto
      return { w: Math.round(nat[k].w * f), h: Math.round(nat[k].h * f) };
    });
    // bajo la ficha, el primer registro asoma a --e4 (tres veces --e2) (su pantalla sube lo que
    // sobra arriba de la imagen centrada; no cambia dónde se detiene el carrusel)
    document.documentElement.style.setProperty('--sube-primero', Math.round((alto - medidas[0].h) / 2) + 'px');
    // y después del último registro, la navegación queda al mismo espacio (lo que sobra
    // debajo de la última imagen centrada se descuenta)
    // Si la última imagen es chica sobraría mucho espacio debajo y la navegación y el pie
    // entrarían en la misma pantalla que el registro (y se encimarían con "Registro 13 / 13").
    // Por eso el espacio es --e4, o lo justo para que la navegación quede fuera de esa pantalla.
    const pantalla = H - cab, ultima = medidas[N - 1].h;
    const sobra = pantalla - margen - (alto + ultima) / 2;
    document.documentElement.style.setProperty('--final-margen', Math.round(Math.max(3 * e2 - sobra, extraBarras() + 2)) + 'px');
    setTam(medidas);
  }, [registros, N]);

  useLayoutEffect(() => {
    ultimaMedida.current = '';
    calcular();
    addEventListener('resize', calcular);
    // si cambia el ancho de la columna (p. ej. aparece la barra de desplazamiento), recalcular
    const celda = document.querySelector('.registro__lugar');
    const ro = celda && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => calcular()) : null;
    if (ro) ro.observe(celda);
    return () => { removeEventListener('resize', calcular); if (ro) ro.disconnect(); };
  }, [calcular]);

  // Preparar (descargar y decodificar) solo los registros cercanos al actual: la página carga
  // rápido y el deslizamiento no se traba al llegar a una imagen nueva.
  useEffect(() => {
    if (!tam) return;
    for (let k = actual - 1; k <= actual + 2; k++) {
      const img = imgs.current[k] && imgs.current[k].querySelector('img');
      if (img) { img.loading = 'eager'; if (img.decode) img.decode().catch(() => {}); }
    }
  }, [tam, actual]);

  // Cuando ya se ve la primera imagen, descargar las demás en orden, de dos en dos y en
  // segundo plano: al recorrer el carrusel cada imagen ya está lista.
  useEffect(() => {
    if (!tam) return;
    let vivo = true;
    const lista = registros.map((r) => r.src);
    const primera = imgs.current[0] && imgs.current[0].querySelector('img');
    const empezar = () => {
      let i = 0;
      const siguiente = () => {
        if (!vivo || i >= lista.length) return;
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = siguiente;
        img.src = lista[i++];
      };
      siguiente(); siguiente();
    };
    if (!primera || primera.complete) empezar();
    else primera.addEventListener('load', empezar, { once: true });
    return () => { vivo = false; };
  }, [tam, registros]);

  // ── Llegada desde el campo: ir a ese registro; la copia crece hasta su lugar ──
  const llegada = useRef(false);
  useLayoutEffect(() => {
    if (!tam || llegada.current) return;
    llegada.current = true;
    const copia = foco !== null ? tomarVuelo() : null;
    if (foco === null) return;
    const k = Math.max(0, Math.min(N - 1, foco));
    if (pantallas.current[k]) scrollTo(0, posicionDe(pantallas.current[k]));
    const el = imgs.current[k];
    if (!copia || !el) { if (copia) copia.remove(); return; }
    el.style.visibility = 'hidden';
    const b = el.getBoundingClientRect();
    requestAnimationFrame(() => Object.assign(copia.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }));
    const fin = () => { el.style.visibility = ''; copia.remove(); };
    copia.addEventListener('transitionend', fin, { once: true });
    setTimeout(fin, 900);
  }, [tam, foco, N]);

  // ── Registro actual (miniaturas y rótulo) ─────────────
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setActual(Number(e.target.dataset.k));
    }), { threshold: 0.55 });
    pantallas.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [N, p]);

  // ¿Estamos dentro del carrusel? (el rótulo solo se ve ahí)
  useEffect(() => {
    let cuadro = null;
    const revisar = () => {
      cuadro = null;
      const a = pantallas.current[0], z = pantallas.current[N - 1];
      if (!a || !z) return;
      const y = scrollY, h = altoPantalla();
      setEnCarrusel(y > posicionDe(a) - h * 0.06 && y < posicionDe(z) + 3);
    };
    const alScroll = () => { if (!cuadro) cuadro = requestAnimationFrame(revisar); };
    revisar();
    addEventListener('scroll', alScroll, { passive: true });
    return () => { removeEventListener('scroll', alScroll); if (cuadro) cancelAnimationFrame(cuadro); };
  }, [N, tam]);

  // miniaturas: la misma escala que los registros grandes (todas reducidas por el mismo factor)
  const minis = useMemo(() => {
    if (!tam) return null;
    const f = MINI / Math.max(...tam.map((m) => m.w));
    let y = 0;
    return tam.map((m) => { const w = Math.round(m.w * f), h = Math.round(m.h * f), top = y; y += h + HUECO_MINI; return { w, h, top }; });
  }, [tam]);

  const ir = (k) => pantallas.current[k] && irAPantalla(pantallas.current[k]);

  if (!p) {
    return (
      <main className="pagina aparecer">
        <Cabecera />
        <div className="pagina__cuerpo"><p>Entrada no encontrada / Entry not found</p></div>
        <Pie />
      </main>
    );
  }

  const i = ENTRADAS.indexOf(p);
  const anterior = i > 0 ? ENTRADAS[i - 1] : null;                  // sin repetir: solo si existe
  const siguiente = i < ENTRADAS.length - 1 ? ENTRADAS[i + 1] : null;
  const f = p.ficha || {};
  const ficha = [
    [t.ubicacion, elegir(f.ubicacion, lang)],
    [t.fecha, f.fecha],
    [t.tipologia, elegir(f.tipologia, lang)],
    [t.area, f.area],
    [t.estatus, elegir(f.estatus, lang)],
  ].filter(([, v]) => v);

  return (
    <main className="pagina entrada aparecer" key={p.slug}>
      <Cabecera />

      {/* Pantalla de la ficha */}
      <section className="entrada__ficha">
        <div className="pagina__cuerpo">
          <div className="dos">
            <div>
              <span>{elegir(p.categoria.nombre, lang)}</span>
              <h1 className="titulo">{elegir(p.nombre, lang)}</h1>
              {elegir(p.credito, lang) && <p className="credito">{elegir(p.credito, lang)}</p>}
            </div>
          </div>
          <dl className="filas">
            {ficha.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* Carrusel: un registro por pantalla */}
      {N > 0 && (
        <div className="registros">
          <div className={'registros__columna' + (enCarrusel ? ' is-visible' : '')} aria-hidden="true">
            <div className="registros__minis">
              <div className="registros__lista" style={{ transform: `translateY(${minis ? -(minis[actual].top + minis[actual].h / 2) : 0}px)` }}>
                {minis && registros.map((r, k) => (
                  <button key={k} tabIndex={-1} onClick={() => ir(k)}
                    style={{ top: minis[k].top, width: minis[k].w, height: minis[k].h }}
                    className={'registros__mini' + (r.dibujo ? ' is-dibujo' : '') + (k === actual ? ' is-actual' : '')}>
                    <img src={r.src} alt="" decoding="async" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {registros.map((r, k) => (
            <section key={k} className="paso registro" ref={(el) => (pantallas.current[k] = el)} data-k={k}>
              <div className="dos registro__fila">
                <div />
                <div className="registro__lugar">
                  <button
                    ref={(el) => (imgs.current[k] = el)}
                    className={'registro__img' + (r.dibujo ? ' is-dibujo' : '')}
                    style={tam ? { width: tam[k].w, height: tam[k].h } : { visibility: 'hidden' }}
                    onClick={() => setVisor(k)}
                    aria-label={`${t.registro} ${k + 1}`}
                  >
                    <img src={r.src} alt={r.alt} decoding="async"
                      loading={k < 2 || (foco !== null && Math.abs(k - foco) < 2) ? 'eager' : 'lazy'}
                      fetchPriority={k === 0 ? 'high' : undefined} />
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Pantalla final: navegación y pie */}
      <div className="entrada__final">
        <nav className="dos navegacion">
          <span>{anterior && <Link to={'/archivo/' + anterior.slug}>&#10094;&nbsp;&nbsp;{elegir(anterior.nombre, lang)}</Link>}</span>
          <span className="a-la-derecha">{siguiente && <Link to={'/archivo/' + siguiente.slug}>{elegir(siguiente.nombre, lang)}&nbsp;&nbsp;&#10095;</Link>}</span>
        </nav>
        <Pie />
      </div>

      {/* "Registro 03 / 16": fijo abajo con el margen de la página, solo dentro del carrusel */}
      {N > 0 && (
        <div className={'entrada__rotulo' + (enCarrusel ? ' is-visible' : '')}>
          <span>{t.registro}</span><span>{pad2(actual + 1)} / {pad2(N)}</span>
        </div>
      )}

      {visor !== null && <Visor items={enGrande} index={visor} onChange={setVisor} onClose={() => setVisor(null)} />}
    </main>
  );
}
