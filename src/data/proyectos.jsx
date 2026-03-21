// data/proyectos.js
import img1 from '../assets/img/proyectos/portadas/portada_pabellon_nbnn.webp';
import img4 from '../assets/img/proyectos/portadas/portada_mesina.webp';

// Datos de los proyectos (compartidos para ambos idiomas)
export const proyectosData = [
  { id: 2, nombre: { es: "MESINA 3190", en: "MESINA 3190" }, img: img4, categoria: { es: "OBRA", en: "WORK" } },
  { id: 3, nombre: { es: "PABELLÓN NBNN", en: "NBNN PAVILION" }, img: img1, categoria: { es: "COLABORACIONES", en: "COLLABORATIONS" } },
];

// Contenido adicional para la página (títulos, etc.)
export const proyectosContent = {
  es: {
    categorias: ["OBRA", "COLABORACIONES"],
    // Si quieres agregar un título principal
    pageTitle: "PROYECTOS",
    pageSubtitle: "Selección de proyectos destacados"
  },
  en: {
    categorias: ["WORK", "COLLABORATIONS"],
    pageTitle: "PROJECTS",
    pageSubtitle: "Selected featured projects"
  }
};