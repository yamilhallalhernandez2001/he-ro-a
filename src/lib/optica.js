// lib/optica.js — ajuste óptico del nombre HE RO A.
// Las letras tienen un pequeño espacio propio a los lados (en letras grandes se nota):
// se compensa para que el trazo de la "H" quede exactamente en el margen izquierdo, igual
// que todo lo demás, y el de la "A" exactamente en el margen derecho.
let lienzo = null;

// Mide el espacio a los lados de una letra DIBUJÁNDOLA y buscando su trazo píxel por píxel
// (no depende de las métricas que reporta cada navegador, que en algunos teléfonos varían).
let cache = {};
export const limpiarOptica = () => { cache = {}; };   // al terminar de cargar la letra
function tinta(fuente, tamano, letra) {
  const k = fuente + '|' + letra;
  if (cache[k]) return cache[k];
  const esc = Math.min(4, 360 / tamano), t = Math.ceil(tamano * esc);   // basta con ~360 px por letra
  lienzo = lienzo || document.createElement('canvas');
  lienzo.width = t * 2; lienzo.height = Math.ceil(t * 1.6);
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.font = fuente.replace(/[\d.]+px/, t + 'px');
  ctx.textBaseline = 'alphabetic';
  const x0 = Math.round(t / 2);
  ctx.fillText(letra, x0, Math.round(t * 1.2));
  const ancho = ctx.measureText(letra).width;
  const { data, width, height } = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
  let min = width, max = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 96) { if (x < min) min = x; if (x > max) max = x; }
  }
  const r = max < 0 ? { izq: 0, der: 0 } : { izq: (min - x0) / esc, der: (x0 + ancho - (max + 1)) / esc };
  return (cache[k] = r);
}

function sangrias(span, letraIzq, letraDer) {
  const cs = getComputedStyle(span);
  const fuente = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, tam = parseFloat(cs.fontSize);
  return {
    izq: Math.max(0, tinta(fuente, tam, letraIzq).izq),    // espacio antes del trazo de la H
    der: Math.max(0, tinta(fuente, tam, letraDer).der),    // espacio después del trazo de la A
  };
}

export function ajustarNombre(contenedor) {
  if (!contenedor) return;
  const [he, ro, a] = contenedor.children;
  if (!he || !a) return;
  he.style.marginLeft = ''; a.style.marginRight = '';
  const s = sangrias(he, 'H', 'A');
  he.style.marginLeft = -s.izq + 'px';
  a.style.marginRight = -s.der + 'px';
  if (ro) fijarLineaRO(ro);
}

// LA LÍNEA DE "RO": el trazo izquierdo de la "R". Es donde empieza la mitad derecha de
// la retícula en todo el sitio (fichas, filas, imágenes, rótulo, Instagram en el pie).
export function fijarLineaRO(ro) {
  const cs = getComputedStyle(ro);
  const x = ro.getBoundingClientRect().left + tinta(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, parseFloat(cs.fontSize), 'R').izq;
  const root = document.documentElement, st = getComputedStyle(root);
  const margen = parseFloat(st.getPropertyValue('--margen')) || 40, hueco = parseFloat(st.getPropertyValue('--hueco')) || 20;
  root.style.setProperty('--linea-ro', x.toFixed(2) + 'px');
  root.style.setProperty('--col-izq', Math.max(0, x - margen - hueco).toFixed(2) + 'px');
  return x;
}
export const lineaRO = () => parseFloat(document.documentElement.style.getPropertyValue('--linea-ro')) || null;

// borde derecho del trazo de la "A" de la cabecera (en px de la ventana): el límite derecho
// de las imágenes, igual que el trazo de la "H" es el límite izquierdo
export function bordeDerechoA() {
  const letras = document.querySelector('.cabecera__letras');
  const a = letras && letras.children[2];
  if (!a) return null;
  return a.getBoundingClientRect().right - sangrias(a, 'H', 'A').der;
}
