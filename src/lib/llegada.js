// lib/llegada.js — al ir del inicio a una página, primero sube el nombre con el menú a la
// cabecera y SOLO DESPUÉS aparece el contenido (y empieza cualquier animación de la página,
// como la aparición del campo). Así la subida no compite con nada y no se traba.
let llegando = false, pendientes = [];

export function empezarLlegada() {
  llegando = true;
  document.documentElement.classList.add('llegando');
}

export function terminarLlegada() {
  if (!llegando) return;
  llegando = false;
  const html = document.documentElement;
  html.classList.remove('llegando');
  html.classList.add('tras-salida');                 // el contenido aparece sin esperar más
  setTimeout(() => html.classList.remove('tras-salida'), 1200);
  const fns = pendientes; pendientes = [];
  fns.forEach((fn) => fn());
}

// ejecuta fn ahora, o cuando termine la subida del nombre
export function cuandoLlegue(fn) {
  if (llegando) pendientes.push(fn); else fn();
}
