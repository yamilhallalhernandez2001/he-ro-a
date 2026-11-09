// ─────────────────────────────────────────────────────────────
// ARCHIVO — este archivo NO hay que editarlo.
// Lee solo las carpetas:
//
//   archivo/
//   ├── archivo.json                     categorías y número de registros en el campo
//   └── proyectos/                            una carpeta por categoría
//       └── mesina-3190/                 una carpeta por entrada (el nombre es su dirección)
//           ├── ficha.json               nombre, datos, colaboración, orden
//           └── registros/
//               ├── imagen/              01.webp, 02.webp, …   (fotografías, renders…)
//               ├── dibujo/              01-planta-baja.webp, …  (dibujo recortado)
//               └── laminas/             01-planta-baja.webp, …  (lámina completa, mismo nombre)
//
// El orden de los registros es el de los nombres de archivo (01, 02, 03…):
// primero todas las imágenes y después todos los dibujos.
// Guía completa en README.md.
// ─────────────────────────────────────────────────────────────
import ajustes from './archivo.json';

const fichas = import.meta.glob('./*/*/ficha.json', { eager: true, import: 'default' });
const archivos = import.meta.glob('./*/*/registros/*/*.{webp,jpg,jpeg,png,WEBP,JPG,JPEG,PNG}', { eager: true, import: 'default' });

const sinExtension = (archivo) => archivo.replace(/\.[^.]+$/, '');
const porNombre = (a, b) => a.localeCompare(b, undefined, { numeric: true });
// "03-seccion-longitudinal" → "Seccion longitudinal" (texto alternativo para lectores de pantalla)
const nombreLegible = (base) => {
  const t = base.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : '';
};

// imágenes agrupadas: entrada → tipo → [{ base, src }]
const porEntrada = {};
for (const [ruta, src] of Object.entries(archivos)) {
  const [, categoria, slug, , tipo, archivo] = ruta.split('/');
  const clave = categoria + '/' + slug;
  ((porEntrada[clave] ||= {})[tipo] ||= []).push({ base: sinExtension(archivo), src });
}

function armarEntrada(categoria, slug, f) {
  const img = porEntrada[categoria + '/' + slug] || {};
  const orden = (lista = []) => [...lista].sort((a, b) => porNombre(a.base, b.base));
  const laminas = Object.fromEntries(orden(img.laminas).map((l) => [l.base, l.src]));
  const registros = [
    ...orden(img.imagen).map((r) => ({ tipo: 'imagen', src: r.src })),
    ...orden(img.dibujo).map((r) => {
      const n = nombreLegible(r.base);
      return { tipo: 'dibujo', src: r.src, lamina: laminas[r.base], nombre: { es: n, en: n } };
    }),
  ];
  return {
    slug,
    orden: f.orden ?? 999,
    idAnterior: f.idAnterior,
    nombre: f.nombre,
    credito: f.colaboracion,
    ficha: { ubicacion: f.ubicacion, fecha: f.fecha, tipologia: f.tipologia, area: f.area, estatus: f.estatus },
    registros,
  };
}

const entradasDe = (carpeta) => Object.entries(fichas)
  .filter(([ruta]) => ruta.split('/')[1] === carpeta)
  .map(([ruta, f]) => armarEntrada(carpeta, ruta.split('/')[2], f))
  .filter((e) => e.registros.length)
  .sort((a, b) => a.orden - b.orden || porNombre(a.slug, b.slug));

// Categorías en el orden de archivo.json (una carpeta sin categoría declarada aparece al final)
const declaradas = ajustes.categorias.map((c) => c.carpeta);
const extra = [...new Set(Object.keys(fichas).map((r) => r.split('/')[1]))].filter((c) => !declaradas.includes(c));
export const CATEGORIAS = [
  ...ajustes.categorias.map((c) => ({ id: c.carpeta, nombre: c.nombre })),
  ...extra.map((c) => ({ id: c, nombre: { es: nombreLegible(c), en: nombreLegible(c) } })),
].map((c) => ({ ...c, entradas: entradasDe(c.id) })).filter((c) => c.entradas.length);

// Número de registros que aparecen en el campo de la página ARCHIVO (regla en lib/campo.js)
export const TOTAL_EN_CAMPO = ajustes.registrosEnCampo;

// Todas las entradas, en el orden de las categorías (índice y navegación ❮ ❯)
export const ENTRADAS = CATEGORIAS.flatMap((c) => c.entradas.map((e) => ({ ...e, categoria: c })));

export const buscarEntrada = (clave) =>
  ENTRADAS.find((e) => e.slug === clave || String(e.idAnterior) === String(clave));

// Registros de una entrada por tipo
export const imagenes = (e) => e.registros.filter((r) => r.tipo === 'imagen');
export const dibujos = (e) => e.registros.filter((r) => r.tipo === 'dibujo');
