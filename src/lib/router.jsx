// lib/router.jsx — enrutador mínimo (sin dependencias).
// En producción usa rutas normales (/archivo, /estudio, /contacto, /archivo/mesina-3190);
// vercel.json ya redirige todo a index.html.
// Si window.__HASH_ROUTER__ es true (vista previa), usa #archivo, #mesina-3190, etc.
import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react';

const HASH = typeof window !== 'undefined' && window.__HASH_ROUTER__ === true;
const PAGES = ['archivo', 'proyectos', 'estudio', 'nosotros', 'contacto'];

function hashToPath(h) {
  const k = h.replace(/^#/, '');
  if (!k || k === 'inicio') return '/';
  if (PAGES.includes(k)) return '/' + k;
  return '/archivo/' + k;
}
function pathToHash(p) {
  const seg = p.split('/').filter(Boolean);
  if (!seg.length) return '#inicio';
  return '#' + seg[seg.length - 1];
}
const current = () => (HASH ? hashToPath(location.hash) : location.pathname.replace(/\/+$/, '') || '/');

const RouterCtx = createContext({ path: '/', navigate: () => {} });

export function Router({ children }) {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const on = () => setPath(current());
    addEventListener(HASH ? 'hashchange' : 'popstate', on);
    return () => removeEventListener(HASH ? 'hashchange' : 'popstate', on);
  }, []);
  const navigate = useCallback((to) => {
    if (to === current()) return;
    if (HASH) location.hash = pathToHash(to);
    else { history.pushState(null, '', to); setPath(to); }
  }, []);
  // al cambiar de página, volver arriba justo después de pintar la nueva (sin ver la anterior)
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [path]);
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

export const useRouter = () => useContext(RouterCtx);

// Al dejar una página, su contenido desaparece con la misma suavidad con la que aparece
// (cabecera y pie se quedan). Del inicio no: ahí el nombre sube a la cabecera.
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SALIDA = 250;   // ms
let saliendo = false;
function salirY(ir) {
  const actual = document.querySelector('main.pagina');
  if (REDUCED || !actual) { ir(); return; }
  if (saliendo) return;
  saliendo = true;
  actual.classList.add('saliendo');
  const html = document.documentElement;
  setTimeout(() => {
    saliendo = false;
    html.classList.add('tras-salida');          // la página nueva aparece sin esperar
    ir();
    setTimeout(() => html.classList.remove('tras-salida'), 1200);
  }, SALIDA);
}

// Al tocar un enlace, el menú cambia de resaltado en ese mismo instante (con su transición),
// mientras la página se desvanece; la página nueva llega con el menú ya en su estado.
const esActivo = (to, path) => to !== '/' && (path === to || path.startsWith(to + '/'));
function marcarMenu(destino) {
  document.querySelectorAll('.menu a[data-to]').forEach((a) => a.classList.toggle('is-active', esActivo(a.dataset.to, destino)));
}

export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate, path } = useRouter();
  const href = HASH ? pathToHash(to) : to;
  const active = esActivo(to, path);
  return (
    <a
      href={href}
      data-to={to}
      className={[className, active ? 'is-active' : ''].filter(Boolean).join(' ')}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (to === current()) return;
        onClick && onClick(e);
        marcarMenu(to);
        salirY(() => navigate(to));
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
