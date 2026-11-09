// lib/transicion.js — al salir del inicio, recuerda dónde estaba el nombre
// para que en la página siguiente suba desde ahí hasta la cabecera.
let origen = null;
export const guardarOrigen = (top) => { origen = top; };
export const tomarOrigen = () => { const o = origen; origen = null; return o; };
