// paginas/Contacto.jsx — correo y teléfono; debajo, fila: Dirección | dirección
import Cabecera from '../componentes/Cabecera';
import Pie from '../componentes/Pie';
import contacto from '../contenido/contacto.json';
import { useLang, useUI } from '../lib/idioma';

export default function Contacto() {
  const { lang } = useLang();
  const t = useUI();
  return (
    <main className="pagina aparecer">
      <Cabecera />
      <div className="pagina__cuerpo">
        <div className="dos"><div>
          <p><a className="enlace-suave" href={`mailto:${contacto.correo}`}>{contacto.correo}</a></p>
          <p>{contacto.telefono}</p>
        </div></div>
        <dl className="filas">
          <div>
            <dt className="titulo">{t.direccion}</dt>
            <dd>{contacto.direccion[lang].map((l) => <p key={l}>{l}</p>)}</dd>
          </div>
        </dl>
      </div>
      <Pie />
    </main>
  );
}
