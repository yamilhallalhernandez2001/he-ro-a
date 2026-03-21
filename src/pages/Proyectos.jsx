// components/Proyectos.jsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { proyectosData, proyectosContent } from '../data/proyectos';
import '../assets/css/proyecto.css';

function Proyectos() {
  const language = useLanguage();
  const content = proyectosContent[language] || proyectosContent.es;

  // Obtener las categorías en el idioma actual
  const categorias = content.categorias;

  return (
    <section className="proyecto">
      <div className="proyecto__container">
        {categorias.map((cat) => (
          <div className="proyecto__content" key={cat}>
            <h2 className="proyecto__title">{cat}</h2>
            <div className="proyecto__text">
              {proyectosData
                .filter((p) => p.categoria[language] === cat)
                .map((p) => (
                  <div className="proyecto_card" key={p.id}>
                    <Link to={`/proyecto/${p.id}`}>
                      <img src={p.img} alt={p.nombre[language]} className="proyecto__img" />
                    </Link>
                    <h3>{p.nombre[language]}</h3>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Proyectos;