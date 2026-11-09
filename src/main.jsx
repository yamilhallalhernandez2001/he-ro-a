import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './estilos.css';
import App from './App.jsx';
import { limpiarOptica } from './lib/optica';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// cuando termina de cargar la letra, volver a medir (nombre, pie, tamaños de imágenes)
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { limpiarOptica(); dispatchEvent(new Event('resize')); });
