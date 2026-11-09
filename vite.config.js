import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// La descripción que muestran Google y las vistas previas de enlaces es el texto del
// estudio (src/contenido/estudio.json): si cambias ese texto, cambia también aquí.
const estudio = JSON.parse(readFileSync(new URL('./src/contenido/estudio.json', import.meta.url), 'utf8'))
const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const descripcion = {
  name: 'descripcion-del-estudio',
  transformIndexHtml: (html) => html
    .replaceAll('%DESCRIPCION_ES%', escapar(estudio.texto.es))
    .replaceAll('%DESCRIPCION_EN%', escapar(estudio.texto.en)),
}

export default defineConfig({
  plugins: [react(), descripcion],
  server: {
    historyApiFallback: true,
  },
})
