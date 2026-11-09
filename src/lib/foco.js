// lib/foco.js — al picar una pieza del campo:
// · recuerda qué registro era, para abrir la entrada justo en él;
// · guarda la copia del registro que "vuela" desde el campo hasta su lugar en la entrada.
let pendiente = null;
let vuelo = null;

export const fijarFoco = (slug, indice, copia = null) => {
  pendiente = { slug, indice };
  if (vuelo) vuelo.remove();
  vuelo = copia;
  if (copia) setTimeout(() => { if (vuelo === copia) { copia.remove(); vuelo = null; } }, 3000); // por si acaso
};
export const leerFoco = (slug) => (pendiente && pendiente.slug === slug ? pendiente.indice : null);
export const borrarFoco = () => { pendiente = null; };
export const tomarVuelo = () => { const v = vuelo; vuelo = null; return v; };
