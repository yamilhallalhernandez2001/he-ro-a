import { useParams } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import getProyectosInfo from "../data/proyectos_info";
import '../assets/css/proyecto_detalle.css';
import Galeria from "../components/Galeria";
import GaleriaPlanimetria from "../components/GaleriaPlanimetria";
import ProyectoNav from "../components/ProyectoNav";

function ProyectoDetalle() {
    const { id } = useParams();
    const language = useLanguage();
    
    // Obtener los proyectos según el idioma actual
    const proyectosInfo = getProyectosInfo(language);
    const proyecto = proyectosInfo.find(proy => proy.id === parseInt(id));

    if (!proyecto) {
        return <div>Proyecto no encontrado / Project not found</div>;
    }

    // Extraer los datos directamente (ya vienen en el idioma correcto)
    const {
        title,
        description,
        image,
        galeria,
        planimetria,
        ubicacion,
        fecha,
        tipologia,
        area,
        estatus,
        descripcion_proyecto,
        tipo
    } = proyecto;

    // Verificar si debe mostrar planimetría (solo si existe y no es mobiliario)
    const shouldShowPlanimetria = tipo !== "piezas" && 
                                   planimetria && 
                                   Array.isArray(planimetria) && 
                                   planimetria.length > 0;

    return (
        <section id="top" className="proyecto-detalle">
            <div className="proyecto-detalle__info">
                <h1>{title}</h1>
                {description && description !== '' && <p>{description}</p>}
            </div>
            <img src={image} alt={title} />
            <div className="proyecto-detalle__meta">
                {tipo === "obras" ? (
                    <div className="ficha">
                        {ubicacion && ubicacion !== '' && (
                            <>
                                <p className="title_ficha">{language === 'es' ? 'Ubicación' : 'Location'}</p>
                                <p className="ficha_text">{ubicacion}</p>
                                <hr />
                            </>
                        )}
                        <p className="title_ficha">{language === 'es' ? 'Fecha' : 'Date'}</p>
                        <p className="ficha_text">{fecha}</p>
                        <hr />
                        <p className="title_ficha">{language === 'es' ? 'Tipología' : 'Typology'}</p>
                        <p className="ficha_text">{tipologia}</p>
                        <hr />
                        {area && area !== '' && (
                            <>
                                <p className="title_ficha">{language === 'es' ? 'Área' : 'Area'}</p>
                                <p className="ficha_text">{area}</p>
                                <hr />
                            </>
                        )}
                        {estatus && estatus !== '' && (
                            <>
                                <p className="title_ficha">{language === 'es' ? 'Estatus' : 'Status'}</p>
                                <p className="ficha_text">{estatus}</p>
                                <hr />
                            </>
                        )}
                    </div>
                ) : (
                    <div className="ficha">
                        <p className="title_ficha">{language === 'es' ? 'Fecha' : 'Date'}</p>
                        <p className="ficha_text">{fecha}</p>
                        <hr />
                        <p className="title_ficha">{language === 'es' ? 'Tipología' : 'Typology'}</p>
                        <p className="ficha_text">{tipologia}</p>
                        <hr />
                    </div>
                )}

                {descripcion_proyecto && descripcion_proyecto !== '' && (
                    <div className="descripcion_proyecto">
                        <p style={{ whiteSpace: 'pre-line' }}>{descripcion_proyecto}</p>
                    </div>
                )}
            </div>
            
            {/* Galería principal */}
            {galeria && Array.isArray(galeria) && galeria.length > 0 && (
                <Galeria imagenes={galeria} />
            )}
            
            {/* Planimetría - solo para proyectos que la tengan */}
            {shouldShowPlanimetria && (
                <>
                    <div className="division"><hr /></div>
                    <GaleriaPlanimetria imagenes={planimetria} />
                </>
            )}
            
            <div className="division"></div>
            <div className="division">
                <ProyectoNav id={proyecto.id} />
            </div>
        </section>
    );
}

export default ProyectoDetalle;