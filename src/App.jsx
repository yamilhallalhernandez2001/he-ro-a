// App.jsx — páginas del sitio
import { useEffect } from 'react';
import { Router, useRouter } from './lib/router';
import { LangProvider } from './lib/idioma';
import { buscarEntrada } from './contenido/archivo/index.js';
import Inicio from './paginas/Inicio';
import Archivo from './paginas/Archivo';
import Entrada from './paginas/Entrada';
import Estudio from './paginas/Estudio';
import Contacto from './paginas/Contacto';

// /archivo y /archivo/<entrada>; /proyectos y /proyecto/<n> siguen funcionando (enlaces antiguos)
const ARCHIVO = ['archivo', 'proyectos', 'proyecto'];

function Paginas() {
  const { path } = useRouter();
  const [a, b] = path.split('/').filter(Boolean);

  let pagina = <Inicio />, titulo = 'HE RO A';
  if (ARCHIVO.includes(a) && b) {
    pagina = <Entrada key={b} clave={b} />;   // cada entrada empieza de cero (tamaños, registro actual)
    const e = buscarEntrada(b);
    if (e) titulo = `${e.nombre.es} — HE RO A`;
  } else if (ARCHIVO.includes(a)) { pagina = <Archivo />; titulo = 'Archivo — HE RO A'; }
  else if (a === 'estudio' || a === 'nosotros') { pagina = <Estudio />; titulo = 'Estudio — HE RO A'; }
  else if (a === 'contacto') { pagina = <Contacto />; titulo = 'Contacto — HE RO A'; }

  useEffect(() => { document.title = titulo; }, [titulo]);
  return <div key={path}>{pagina}</div>;
}

export default function App() {
  return (
    <LangProvider>
      <Router>
        <Paginas />
      </Router>
    </LangProvider>
  );
}
