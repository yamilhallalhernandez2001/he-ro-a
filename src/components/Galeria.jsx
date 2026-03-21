import { useState, useEffect, useCallback } from "react";
import "../assets/css/galeria.css";

function Galeria({ imagenes = [] }) {
  const [imagenActiva, setImagenActiva] = useState(null);
  const [indiceActivo, setIndiceActivo] = useState(null);

  const abrirImagen = (src, index) => {
    setImagenActiva(src);
    setIndiceActivo(index);
  };
  
  const cerrarImagen = () => {
    setImagenActiva(null);
    setIndiceActivo(null);
  };

  // Navegar a la imagen anterior
  const imagenAnterior = () => {
    if (indiceActivo > 0) {
      const nuevoIndice = indiceActivo - 1;
      setIndiceActivo(nuevoIndice);
      setImagenActiva(imagenes[nuevoIndice]);
    }
  };

  // Navegar a la siguiente imagen
  const imagenSiguiente = () => {
    if (indiceActivo < imagenes.length - 1) {
      const nuevoIndice = indiceActivo + 1;
      setIndiceActivo(nuevoIndice);
      setImagenActiva(imagenes[nuevoIndice]);
    }
  };

  // Manejar teclado: flechas izquierda/derecha y Escape
  const handleKeyDown = useCallback((e) => {
    if (!imagenActiva) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        imagenAnterior();
        break;
      case 'ArrowRight':
        e.preventDefault();
        imagenSiguiente();
        break;
      case 'Escape':
        e.preventDefault();
        cerrarImagen();
        break;
      default:
        break;
    }
  }, [imagenActiva, indiceActivo, imagenes]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="galeria">
      <div className="galeria__grid">
        {imagenes.map((img, index) => (
          <div
            className="galeria__item"
            key={index}
            onClick={() => abrirImagen(img, index)}
          >
            <img src={img} alt={`Imagen ${index + 1}`} />
          </div>
        ))}
      </div>

      {imagenActiva && (
        <div className="galeria__overlay" onClick={cerrarImagen}>
          {/* Botón anterior */}
          {indiceActivo > 0 && (
            <button
              className="galeria__nav galeria__nav--anterior"
              onClick={(e) => {
                e.stopPropagation();
                imagenAnterior();
              }}
              aria-label="Imagen anterior"
            >
              &#10094;
            </button>
          )}
          
          {/* Imagen activa */}
          <img
            src={imagenActiva}
            alt={`Vista ampliada ${indiceActivo + 1} de ${imagenes.length}`}
            className="galeria__imagen-activa"
          />
          
          {/* Botón siguiente */}
          {indiceActivo < imagenes.length - 1 && (
            <button
              className="galeria__nav galeria__nav--siguiente"
              onClick={(e) => {
                e.stopPropagation();
                imagenSiguiente();
              }}
              aria-label="Imagen siguiente"
            >
              &#10095;
            </button>
          )}
          
          {/* Indicador de posición */}
          <div className="galeria__indicador">
            {indiceActivo + 1} / {imagenes.length}
          </div>
          
          
        </div>
      )}
    </div>
  );
}

export default Galeria;