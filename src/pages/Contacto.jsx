import React from 'react';
import '../assets/css/contacto.css';

function Contacto() {
  return (
    <section className="contacto">
      <div>
      </div>

      <div className="contacto__info">
        {/* Nombre / Empresa */}
        <p className="contacto__nombre"><strong>HE RO A</strong></p>

        <div className="contacto__direccion">
            <p>Volcán Jorullo 2157</p>
            <p>Colonia Colli Urbano</p>
            <p>45070, Guadalajara, México</p>
        </div>

        {/* Separador */}
        <hr />
        {/* Correo y teléfono */}
        <p>
          <a href="mailto:info@he-ro-a.com" className="contacto__link">
            info@he-ro-a.com
          </a>
        </p>
        <p>+52 (33) 3326 0003</p>
      </div>
    </section>
  );
}

export default Contacto;
