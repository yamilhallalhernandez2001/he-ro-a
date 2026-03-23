import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import '../assets/css/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__social">
        {/* <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a> */}
        <a className='social' 
          href="https://www.instagram.com/he.ro.a?igsh=bmMxZzFidjhqdDU1&utm_source=qr" 
          target="_blank" 
          rel="noreferrer">
          INSTAGRAM
        </a>
        {/* <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a> */}
        {/* <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedinIn /></a> */}
      </div>
      <div className="footer__info">
        <p><span>©</span> 2025 HE RO A</p>
      </div>
    </footer>
  );
}

export default Footer;
