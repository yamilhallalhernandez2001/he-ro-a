import React from 'react';
import '../assets/css/contacto.css';
import { useLanguage } from '../hooks/useLanguage';
import { contactoContent } from '../data/contacto';

function Contacto() {
  const language = useLanguage();
  const content = contactoContent[language] || contactoContent.es;

  return (
    <section className="contacto">
      <div></div>

      <div className="contacto__info">
        {/* Nombre */}
        <p className="contacto__nombre">
          <strong>{content.nombre}</strong>
        </p>

        {/* Dirección dinámica */}
        <div className="contacto__direccion">
          {content.direccion.map((linea, idx) => (
            <p key={idx}>{linea}</p>
          ))}
        </div>

        <hr />

        {/* Email */}
        <p>
          <a href={`mailto:${content.email}`} className="contacto__link">
            {content.email}
          </a>
        </p>

        {/* Teléfono */}
        <p>{content.telefono}</p>
      </div>
    </section>
  );
}

export default Contacto;