// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import Proyectos from './pages/Proyectos';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProyectoDetalle from './pages/ProyectoDetalle';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Inicio/>} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyecto/:id" element={<ProyectoDetalle />} /> 
        <Route path="/contacto" element={<Contacto />} /> 
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;