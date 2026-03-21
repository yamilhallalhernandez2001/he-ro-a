// components/Nosotros.jsx
import { useLanguage } from '../hooks/useLanguage';
import { nosotrosContent } from '../data/nosotros';
import '../assets/css/nosotros.css';

function Nosotros() {
  const language = useLanguage();
  const content = nosotrosContent[language] || nosotrosContent.es;

  return (
    <section className="nosotros">
      <div className="nosotros__content">
        <h2 className="nosotros__title">{content.title}</h2>
        <p className='nosotros__text'>
          {content.text}
        </p>
      </div>

      <div className="nosotros__content">
        <h2 className="nosotros__title">{content.publicationsTitle}</h2>
        <div className='nosotros__text'>
          {content.publications.map((publication, idx) => (
            <div key={idx} className="nosotros__publication">
              <strong>{publication.outlet}</strong>
              <br />
              {publication.links.map((link, linkIdx) => (
                <span key={linkIdx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                  {linkIdx < publication.links.length - 1 && <br />}
                </span>
              ))}
              {idx < content.publications.length - 1 && <br />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Nosotros;