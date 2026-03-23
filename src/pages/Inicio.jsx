import React, { useState, useEffect } from 'react';
import '../assets/css/inicio.css';

import img1 from '../assets/img/inicio/1.webp';
import img2 from '../assets/img/inicio/2.webp';
import img3 from '../assets/img/inicio/3.webp';
import img4 from '../assets/img/inicio/4.webp';


function Inicio() {
  const images = [img1, img2, img3, img4];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // cambia cada 5 segundos
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="inicio">
        
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide ${index === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      ))}

      {/* Indicadores opcionales */}
      <div className="indicators">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>  
    </section>

  );
}

export default Inicio;
