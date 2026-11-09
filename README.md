# HE RO A — sitio web

Estudio de arquitectura · Guadalajara, México · [he-ro-a.com](https://he-ro-a.com)

Hecho con React + Vite y publicado en Vercel. Cada cambio guardado en la rama principal de GitHub publica el sitio automáticamente.

## Estructura del código

```
src/
├── contenido/      ← lo único que normalmente se edita: archivo/, estudio.json, contacto.json
├── paginas/        Inicio, Archivo (el campo), Entrada, Estudio, Contacto
├── componentes/    Cabecera, Pie, Visor
├── lib/            router, idioma (ES / EN), campo, pasos (acomodo por pantallas), óptica del nombre
├── fuentes/        Liberation Sans en .woff2 (respaldo de Arial)
└── estilos.css     todo el diseño
```

## Cómo se organiza el archivo

```
archivo
└── categoría            Proyectos                     (después: Artículos, Mobiliario…)
    └── entrada          Mesina 3190, Pabellón NBNN
        └── registro     cada archivo: una imagen (fotografía, render…) o un dibujo (planta, corte…)
```

**Todo el contenido son carpetas, imágenes y un archivo de texto por entrada. No hay que tocar código.**
El sitio lee solo las carpetas: lo que subes aparece; lo que borras desaparece.

```
src/contenido/archivo/
├── archivo.json                       categorías y número de registros en el campo
└── proyectos/                              ← una carpeta por categoría
    ├── mesina-3190/                   ← una carpeta por entrada (su nombre es su dirección)
    │   ├── ficha.json                 nombre y datos
    │   └── registros/
    │       ├── imagen/                01.webp, 02.webp, 03.webp…  (fotografías, renders…)
    │       ├── dibujo/                01-planta-baja.webp, 02-nivel-2-4.webp…  (dibujo recortado)
    │       └── laminas/               01-planta-baja.webp, 02-nivel-2-4.webp…  (lámina completa)
    └── pabellon-nbnn/ …
```

## Cómo hacer cambios (desde el navegador, sin instalar nada)

Todo se hace en **github.com**, en tu repositorio. Cada vez que guardas un cambio ("Commit changes"),
Vercel publica el sitio solo; en uno o dos minutos se ve en he-ro-a.com.

### Cambiar, agregar o quitar imágenes de una entrada

1. Entra a `src/contenido/archivo/proyectos/<entrada>/registros/` y a la carpeta que corresponda
   (`imagen`, `dibujo` o `laminas`).
2. **Agregar:** botón **Add file → Upload files**, arrastra las imágenes y pulsa **Commit changes**.
   **Reemplazar:** sube una imagen con exactamente el mismo nombre.
   **Quitar:** abre la imagen → menú **⋯** → **Delete file** → **Commit changes**.
3. **El orden lo da el nombre del archivo:** `01`, `02`, `03`… (usa siempre dos cifras).
   En la entrada se ven primero todas las imágenes y después todos los dibujos.

### Agregar una entrada nueva

1. En tu computadora, prepara una carpeta con el nombre de la entrada en **minúsculas y con guiones**,
   sin acentos ni espacios, p. ej. `casa-tlaquepaque` (será su dirección: he-ro-a.com/archivo/casa-tlaquepaque).
   Dentro, la misma estructura que las demás:
   ```
   casa-tlaquepaque/
   ├── ficha.json               (copia el de otra entrada y cambia los textos)
   └── registros/
       ├── imagen/              01.webp, 02.webp…
       ├── dibujo/              01-planta.webp…
       └── laminas/             01-planta.webp…
   ```
2. En GitHub entra a `src/contenido/archivo/proyectos/`, **Add file → Upload files** y **arrastra la carpeta completa**
   (GitHub conserva las subcarpetas). Pulsa **Commit changes**.
3. Listo: aparece sola en el índice del Archivo, en el campo y en la navegación ❮ ❯ entre entradas.

### Editar la ficha de una entrada

Abre su `ficha.json` y pulsa el lápiz (**Edit this file**). Solo cambia los textos **entre comillas**;
no borres comas, llaves ni comillas.

```json
{
  "orden": 3,
  "nombre": { "es": "Casa Tlaquepaque", "en": "Tlaquepaque House" },
  "colaboracion": { "es": "", "en": "" },
  "ubicacion": { "es": "Tlaquepaque, JAL, MX", "en": "Tlaquepaque, JAL, MX" },
  "fecha": "2026",
  "tipologia": { "es": "Vivienda", "en": "Housing" },
  "area": "240 m²",
  "estatus": { "es": "En proyecto", "en": "In design" }
}
```

- **orden:** posición en el índice y en la navegación (1, 2, 3…).
- **colaboracion:** aparece bajo el nombre (p. ej. "HE RO A + Azano Moritani"); vacío si no aplica.
- Un dato que se deja vacío (`""`) no se muestra.
- Escribe en minúsculas normales ("Casa Tlaquepaque"); en todo el sitio solo HE RO A va en mayúsculas.
- `idAnterior` (solo en las dos primeras entradas) mantiene funcionando enlaces antiguos; no lo copies.

Si GitHub marca un error al guardar o el sitio no se publica, casi siempre es una coma o comilla
faltante en el `ficha.json`: compáralo con el de otra entrada.

### Agregar una categoría (p. ej. Artículos)

1. Crea su carpeta junto a `proyectos/` (p. ej. `articulos/`) con sus entradas, igual que arriba.
2. Edita `archivo.json` y agrega su nombre en la lista `categorias`:
   ```json
   { "carpeta": "articulos", "nombre": { "es": "Artículos", "en": "Articles" } }
   ```
   (separada de la anterior con una coma). El orden de la lista es el orden del índice.

## Cómo preparar las imágenes

### La regla de acomodo (igual para imágenes y dibujos, en todos los proyectos)

- Cada registro tiene la misma caja: de la línea de "RO" al trazo de la "A" (en el teléfono, del trazo
  de la "H" al de la "A"), y de abajo del menú hasta el rótulo "Registro 03 / 16".
- La imagen **crece hasta tocar el ancho o el alto** de la caja, lo que llegue primero. No se corta ni se deforma.
- Se **alinea a la izquierda** y se **centra de arriba abajo**.
- Las horizontales suelen llenar el ancho; las verticales, el alto.
- No hay nada que configurar por proyecto: el sitio mide cada imagen y la acomoda solo.

**Imágenes** → `imagen/` (fotografías, renders, collages…)
- `.webp` o `.jpg`, lado mayor de unos **1600 px**, menos de ~500 KB cada una
  (para convertir y reducir: [squoosh.app](https://squoosh.app), gratis, en el navegador).

**Dibujos** → `dibujo/` (dibujo recortado) y `laminas/` (hoja completa, **mismo nombre**)
- Nombre: número y descripción, p. ej. `03-seccion-longitudinal.webp`.
- **Recorte:** solo el dibujo, **justo a su borde**, sin margen blanco, sin marco, cajetín, escala gráfica
  ni marcas de corte sueltas. Es lo único importante: así el dibujo queda alineado exacto con la caja.
- Resolución: lado mayor de unos **1600–2000 px**, para que se vea nítido en cualquier pantalla.
  No importa que cada dibujo tenga un tamaño distinto; el sitio los acomoda con la regla de arriba.
- La lámina es opcional: si un dibujo no tiene lámina con su mismo nombre, al abrirlo en grande se ve el dibujo recortado.
- **Lámina:** la hoja original completa, lado mayor de unos 2600 px. Es lo que se ve al abrir el registro en grande.

## El campo (página Archivo)

Automático: no hay nada que configurar al agregar un proyecto. En cada visita se eligen otros registros.

1. El campo muestra siempre **17 registros** (`registrosEnCampo` en `src/contenido/archivo/archivo.json`).
2. Se reparten **por partes iguales** entre todos los proyectos (si no se divide exacto, los que sobran
   van a proyectos al azar).
3. La parte de cada proyecto es **mitad imágenes y mitad dibujos**, elegidos al azar.
4. **Mínimo 1 imagen y 1 dibujo** por proyecto (si los tiene). Si llegan a ser más de 8 proyectos, en cada
   visita se eligen al azar los que aparecen.
5. **Si a un proyecto le faltan de un tipo**, completa con el otro tipo del mismo proyecto.
   Ej.: 5 imágenes y 1 dibujo → pone su único dibujo y más imágenes.
6. **Si a un proyecto no le alcanza su material** (ej.: una sola imagen), pone lo que tiene y lo que falta
   se completa con registros al azar de otros proyectos, manteniendo lo más posible mitad imágenes y mitad dibujos.
7. Si entre todos los proyectos no hay 17 registros, se muestran todos los que hay.

## Estudio y Contacto

Igual que las fichas: archivos de texto en `src/contenido/`, se editan con el lápiz en GitHub.

**`estudio.json`**: el texto del estudio, el equipo y las publicaciones.
- **Agregar a alguien al equipo:** copia el bloque de una persona `{ … }`, pégalo después con una coma
  en medio y cambia los textos. Se muestran en el orden de la lista.
  ```json
  "equipo": [
    { "nombre": "Diego Hernández Rodríguez", "cargo": { "es": "…", "en": "…" }, "formacion": { "es": "…", "en": "…" } },
    { "nombre": "Nueva persona", "cargo": { "es": "Arquitecta", "en": "Architect" }, "formacion": { "es": "", "en": "" } }
  ]
  ```
- **Agregar una publicación:** igual, copiando un bloque de `"publicaciones"` (medio, título y enlace).
  Si la lista queda vacía, la fila de Publicaciones no se muestra.

**`contacto.json`**: correo, teléfono, Instagram (también el del pie) y dirección (una línea por renglón).

**Menú y etiquetas** (Archivo, Estudio, Contacto, Ubicación, Fecha…): `src/lib/idioma.jsx`.

## Trabajar en tu computadora

```bash
npm install
npm run dev      # vista local en http://localhost:5173
npm run build    # comprobar que compila antes de subir
```

Nota: `react-router-dom` y `react-icons` siguen en `package.json` pero ya no se usan.
Se pueden quitar con `npm uninstall react-router-dom react-icons`.

## Cómo se recorre una entrada

Todo va por pantallas, con el mismo movimiento que el Archivo (campo → índice). Cada gesto (rueda,
trackpad, dedo o teclado) lleva a la pantalla siguiente o anterior, en ambos sentidos:

1. **Ficha.** Debajo asoma el primer registro a su tamaño real; si no cabe, la pantalla lo corta.
2. **Carrusel:** un registro por pantalla, con miniaturas a la izquierda y "Registro 03 / 16" fijo abajo.
3. **Final:** navegación a las otras entradas y pie.

## Letra

Arial, en computadora y teléfono. En los equipos que no la tienen (Android) se usa Liberation Sans,
un dibujo libre con las mismas medidas que Arial (`src/fuentes/`, licencia SIL OFL incluida).
