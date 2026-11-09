// lib/campo.js — qué registros aparecen en el campo de la página ARCHIVO.
// Se calcula de nuevo en cada visita, así el campo va rotando.
//
// Regla (automática: no hay nada que configurar al agregar un proyecto):
//  1. El campo tiene siempre el mismo número de registros (registrosEnCampo en archivo.json).
//  2. Ese número se reparte por partes iguales entre todas las entradas, de todas las
//     categorías. Si no se divide exacto, los registros que sobran se dan, uno a cada una,
//     a entradas elegidas al azar.
//  3. La parte de cada entrada se divide a la mitad: imágenes y dibujos. Si es impar, el
//     registro extra va al azar a uno u otro tipo.
//  4. Los registros de cada entrada se eligen al azar entre todos los suyos.
//  5. Mínimo por entrada: 1 imagen y 1 dibujo (si los tiene). Si hay tantas entradas que no
//     caben con ese mínimo, en cada visita se eligen al azar las entradas que aparecen.
//  6. Si a una entrada le faltan registros de un tipo, completa con el otro tipo de la misma
//     entrada (p. ej. 5 imágenes y 1 dibujo: pone su único dibujo y más imágenes).
//  7. Si aun así a la entrada no le alcanza su material (p. ej. una sola imagen), lo que falta
//     se completa con registros al azar de otras entradas que todavía tengan, procurando
//     mantener la mitad imágenes y mitad dibujos.
//  8. Si entre todas las entradas no hay suficientes registros, se muestran todos los que hay.

import { imagenes, dibujos } from '../contenido/archivo/index.js';

const barajar = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export function elegirPiezas(entradas, total) {
  const maxEntradas = Math.floor(total / 2);                       // 5. mínimo 2 registros por entrada
  const elegidas = entradas.length > maxEntradas ? barajar(entradas).slice(0, maxEntradas) : entradas;
  const n = elegidas.length;
  if (!n) return [];

  // 2. parte de cada entrada
  const parte = elegidas.map(() => Math.floor(total / n));
  barajar(elegidas.map((_, i) => i)).slice(0, total % n).forEach((i) => parte[i]++);

  // 3. mitad imágenes, mitad dibujos
  const plan = elegidas.map((e, i) => {
    let im = Math.floor(parte[i] / 2), di = parte[i] - im;
    if (parte[i] % 2 && Math.random() < 0.5) { im++; di--; }
    return { e, im, di, imgs: imagenes(e), dibs: dibujos(e) };
  });

  // 6. completar con el otro tipo de la misma entrada; 7. lo que falte, a otras entradas
  let faltan = 0;
  plan.forEach((x) => {
    const ni = x.imgs.length, nd = x.dibs.length;
    if (x.im > ni) { x.di += x.im - ni; x.im = ni; }
    if (x.di > nd) { x.im += x.di - nd; x.di = nd; }
    if (x.im > ni) { faltan += x.im - ni; x.im = ni; }
  });
  while (faltan > 0) {
    // entradas al azar que todavía tengan material; se da el tipo que mantenga el equilibrio
    const conMaterial = barajar(plan.filter((x) => x.im < x.imgs.length || x.di < x.dibs.length));
    if (!conMaterial.length) break;                                 // 8. no hay más registros
    for (const x of conMaterial) {
      if (faltan <= 0) break;
      const totalIm = plan.reduce((s, y) => s + y.im, 0), totalDi = plan.reduce((s, y) => s + y.di, 0);
      const puedeIm = x.im < x.imgs.length, puedeDi = x.di < x.dibs.length;
      if (puedeIm && (!puedeDi || totalIm <= totalDi)) x.im++; else x.di++;
      faltan--;
    }
  }

  // 4. elegir al azar dentro de cada entrada
  const piezas = [];
  plan.forEach(({ e, im, di, imgs, dibs }) => {
    // `indice` = posición del registro dentro de la entrada (para abrirla justo ahí)
    barajar(imgs).slice(0, im).forEach((r) => piezas.push({ src: r.src, tipo: r.tipo, indice: e.registros.indexOf(r), entrada: e }));
    barajar(dibs).slice(0, di).forEach((r) => piezas.push({ src: r.src, tipo: r.tipo, indice: e.registros.indexOf(r), entrada: e }));
  });
  return piezas;
}
