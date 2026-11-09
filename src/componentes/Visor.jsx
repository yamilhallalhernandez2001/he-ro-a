// componentes/Visor.jsx — imagen a pantalla completa (fondo blanco)
import { useEffect } from 'react';
import { useUI } from '../lib/idioma';

export default function Visor({ items, index, onChange, onClose }) {
  const t = useUI();
  const n = items.length;
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange((index + 1) % n);
      if (e.key === 'ArrowLeft') onChange((index - 1 + n) % n);
    };
    addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [index, n, onChange, onClose]);
  const it = items[index];
  return (
    <div className="visor" role="dialog" aria-modal="true">
      <div className="visor__barra">
        <span>{it.capitulo}&nbsp;&nbsp;&nbsp;{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button onClick={onClose}>{t.cerrar}</button>
      </div>
      <div className="visor__imagen">
        <img key={index} src={it.src} alt="" />
        <button className="visor__ant" aria-label={t.anterior} onClick={() => onChange((index - 1 + n) % n)} />
        <button className="visor__sig" aria-label={t.siguiente} onClick={() => onChange((index + 1) % n)} />
      </div>
    </div>
  );
}
