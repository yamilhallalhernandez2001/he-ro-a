// paginas/Estudio.jsx — texto del estudio; debajo, filas: título (mitad izquierda) | contenido (mitad derecha).
// El contenido está en contenido/estudio.json (equipo y publicaciones son listas: se agregan personas o
// publicaciones copiando un bloque).
import Cabecera from '../componentes/Cabecera';
import Pie from '../componentes/Pie';
import estudio from '../contenido/estudio.json';
import { useLang, useUI, elegir } from '../lib/idioma';

export default function Estudio() {
  const { lang } = useLang();
  const t = useUI();
  return (
    <main className="pagina aparecer">
      <Cabecera />
      <div className="pagina__cuerpo">
        <div className="dos"><p className="texto">{elegir(estudio.texto, lang)}</p></div>
        <dl className="filas">
          <div>
            <dt className="titulo">{t.equipo}</dt>
            <dd className="lista">
              {estudio.equipo.map((m) => (
                <p key={m.nombre}>
                  {[m.nombre, elegir(m.cargo, lang), elegir(m.formacion, lang)].filter(Boolean)
                    .map((linea, i) => <span key={i}>{i > 0 && <br />}{linea}</span>)}
                </p>
              ))}
            </dd>
          </div>
          {estudio.publicaciones.length > 0 && <div>
            <dt className="titulo">{t.publicaciones}</dt>
            <dd className="lista">
              {estudio.publicaciones.map((x) => (
                <p key={x.url}>
                  <span>{x.medio}</span><br />
                  <a className="enlace" href={x.url} target="_blank" rel="noreferrer">{x.titulo}</a>
                </p>
              ))}
            </dd>
          </div>}
        </dl>
      </div>
      <Pie />
    </main>
  );
}
