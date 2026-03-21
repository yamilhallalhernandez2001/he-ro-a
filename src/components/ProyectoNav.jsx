import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import getProyectosInfo from "../data/proyectos_info";
import '../assets/css/proyecto_nav.css';


function ProyectoNav({ id }) {
    const language = useLanguage();
    const proyectosInfo = getProyectosInfo(language);
    
    // Verificar que proyectosInfo sea un array
    if (!Array.isArray(proyectosInfo)) {
        console.error('proyectosInfo no es un array:', proyectosInfo);
        return null;
    }
    
    // Encontrar el índice del proyecto actual
    const currentIndex = proyectosInfo.findIndex(proy => proy.id === id);
    
    // Si no se encuentra el proyecto, no mostrar navegación
    if (currentIndex === -1) {
        return null;
    }
    
    // Obtener proyecto anterior y siguiente
    const prevProyecto = currentIndex > 0 ? proyectosInfo[currentIndex - 1] : null;
    const nextProyecto = currentIndex < proyectosInfo.length - 1 ? proyectosInfo[currentIndex + 1] : null;
    
    // Textos según idioma
    const textoAnterior = language === 'es' ? 'Anterior' : 'Previous';
    const textoSiguiente = language === 'es' ? 'Siguiente' : 'Next';
    
    return (
        <div className="proyecto-nav">
            {prevProyecto && (
                <Link to={`/proyecto/${prevProyecto.id}`} className="proyecto-nav__prev">
                    &#10094; {prevProyecto.title}
                </Link>
            )}
            {nextProyecto && (
                <Link to={`/proyecto/${nextProyecto.id}`} className="proyecto-nav__next">
                    {nextProyecto.title} &#10095;
                </Link>
            )}
        </div>
    );
}

export default ProyectoNav;