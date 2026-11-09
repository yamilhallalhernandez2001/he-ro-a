// lib/proporciones.js — mide cada imagen (ancho y alto en píxeles), así no hay que escribir
// medidas a mano al agregar fotos o planos.
// Con { soloMedida: true } (registros de una entrada) las medidas se leen del principio de
// cada archivo, sin esperar a que termine de descargarse. Si eso falla, se mide cargando
// la imagen completa.
const cache = new Map();

// Lee ancho y alto del encabezado de un archivo WebP, PNG o JPEG.
function medidasDe(b) {
  const u32 = (i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24) >>> 0;
  const txt = (i, n) => String.fromCharCode(...b.slice(i, i + n));
  if (b.length >= 30 && txt(0, 4) === 'RIFF' && txt(8, 4) === 'WEBP') {
    const tipo = txt(12, 4);
    if (tipo === 'VP8X') return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    if (tipo === 'VP8L') { const v = u32(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
    if (tipo === 'VP8 ') return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  if (b.length >= 24 && b[0] === 0x89 && txt(1, 3) === 'PNG') {
    return { w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0 };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xff || m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) { i++; continue; }
      const largo = (b[i + 2] << 8) | b[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: (b[i + 7] << 8) | b[i + 8], h: (b[i + 5] << 8) | b[i + 6] };
      i += 2 + largo;
    }
  }
  return null;
}

// Lee las medidas en cuanto llega el principio del archivo y corta la descarga: el acomodo
// no espera y la primera imagen no compite con las demás. (Entrada.jsx descarga después
// las demás en orden, en segundo plano.)
function medirPorEncabezado(src) {
  return new Promise((resolve) => {
    fetch(src).then(async (res) => {
      if (!res.ok || !res.body) { resolve(null); return; }
      const lector = res.body.getReader();
      let datos = new Uint8Array(0), listo = false;
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        if (!listo && datos.length < 262144) {
          const junto = new Uint8Array(datos.length + value.length);
          junto.set(datos); junto.set(value, datos.length); datos = junto;
          const m = medidasDe(datos);
          if (m && m.w && m.h) { listo = true; resolve(m); lector.cancel().catch(() => {}); return; }
        }
      }
      if (!listo) resolve(medidasDe(datos));
    }).catch(() => resolve(null));
  });
}

export function medirTamano(src, { soloMedida = false } = {}) {
  if (soloMedida && !cache.has(src) && typeof fetch === 'function') {
    cache.set(src, medirPorEncabezado(src).catch(() => null).then((m) => m || medirConImagen('img:' + src)));
  }
  return cache.get(src) || medirConImagen(src);
}

function medirConImagen(clave) {
  const src = clave.replace(/^img:/, '');
  if (!cache.has(clave)) {
    cache.set(clave, new Promise((resolve) => {
      const img = new Image();
      let listo = false, cuadro = null;
      const fin = (m) => {
        if (listo) return;
        listo = true;
        cancelAnimationFrame(cuadro);
        resolve(m);
      };
      const revisar = () => {
        if (img.naturalWidth && img.naturalHeight) fin({ w: img.naturalWidth, h: img.naturalHeight });
        else if (!listo) cuadro = requestAnimationFrame(revisar);
      };
      img.onload = () => fin({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      img.onerror = () => fin({ w: 1, h: 1 });
      img.decoding = 'async';
      img.src = src;
      cuadro = requestAnimationFrame(revisar);
    }));
  }
  return cache.get(clave);
}

// proporción ancho / alto
export const medir = (src) => medirTamano(src).then(({ w, h }) => w / h);
export const medirTodas = (lista) => Promise.all(lista.map(medir));
