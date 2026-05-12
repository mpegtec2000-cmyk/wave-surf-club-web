'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CAROUSEL_IMAGES = [
  '/CARUSEL/1.jpg',
  '/CARUSEL/2.jpg',
  '/CARUSEL/3.jpg',
  '/CARUSEL/4.png'
];

export default function LandingPage() {
  const { t } = useTranslation();
  const [showBooking, setShowBooking] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productos, setProductos] = useState([]);
  const [productSlide, setProductSlide] = useState(0);

  useEffect(() => {
    fetchProductos();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from('productos_tienda')
      .select('*, categorias_tienda(nombre)')
      .eq('activo', true)
      .limit(8);
    if (data) setProductos(data);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  const nextProd = () => setProductSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(productos.length / 4)));
  const prevProd = () => setProductSlide((prev) => (prev - 1 + Math.ceil(productos.length / 4)) % Math.ceil(productos.length / 4));

  return (
    <>
      <Navbar />
      <main className="landing-main">
        <div id="hero" className="hero-section">

          <div className="hero-video-wrapper">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="hero-video"
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="hero-video-overlay"></div>
          </div>

          <div className="hero-content">
            <span className="since">SINCE-2015</span>
            <h1 className="main-brand-title">WAVE SURF CLUB</h1>
            <p className="hero-description">
              Todo partió como un sueño y se hizo realidad. Dedicados a la enseñanza del Skate y Surf en las mejores playas de Chile.
            </p>
            <div className="hero-actions">
              <a href="/riders" className="btn-pill-premium">
                <span className="booking-dot"></span>
                Conoce a tu profesor
              </a>
            </div>
          </div>
        </div>

        {/* CAROUSEL SECTION */}
        <section className="carousel-section">
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {CAROUSEL_IMAGES.map((img, idx) => (
                <div key={idx} className="carousel-slide">
                  <Image 
                    src={img} 
                    alt={`Slide ${idx + 1}`} 
                    fill 
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="slide-overlay"></div>
                </div>
              ))}
            </div>
            
            <button className="carousel-btn prev" onClick={prevSlide}><ChevronLeft size={30} /></button>
            <button className="carousel-btn next" onClick={nextSlide}><ChevronRight size={30} /></button>
            
            <div className="carousel-dots">
              {CAROUSEL_IMAGES.map((_, idx) => (
                <button 
                  key={idx} 
                  className={`dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="featured-section">
          <div className="section-header">
            <span className="section-subtitle">EXPERIENCIA WAVE</span>
            <h2 className="section-title">NUESTROS SERVICIOS</h2>
          </div>
          <div className="content-grid-placeholder">
            <div className="glass-card-premium">
              <div className="card-icon">🏄‍♂️</div>
              <h3>Escuela de Surf</h3>
              <p>Desde principiantes hasta nivel avanzado con instructores certificados.</p>
              <a href="/escuelas" className="btn-link">Ver Horarios</a>
            </div>
            <div className="glass-card-premium">
              <div className="card-icon">🛹</div>
              <h3>Skate Park</h3>
              <p>Clases de skate y rampas profesionales para perfeccionar tu estilo.</p>
              <a href="/servicios" className="btn-link">Ver Clases</a>
            </div>
            <div className="glass-card-premium">
              <div className="card-icon">🔧</div>
              <h3>Taller Experto</h3>
              <p>Reparación de tablas y mantenimiento de equipos con manos expertas.</p>
              <a href="/taller" className="btn-link">Solicitar Arreglo</a>
            </div>
          </div>
        </section>

        {/* PRODUCT CAROUSEL SECTION */}
        {productos.length > 0 && (
          <section className="product-carousel-section">
            <div className="section-header">
              <span className="section-subtitle">WAVE SHOP</span>
              <h2 className="section-title">PRODUCTOS DESTACADOS</h2>
            </div>
            
            <div className="product-carousel-container">
              <div className="product-track" style={{ transform: `translateX(-${productSlide * 100}%)` }}>
                {productos.map((prod) => (
                  <div key={prod.id} className="product-slide-card">
                    <div className="prod-img-box">
                      {prod.imagen_url ? (
                        <img src={prod.imagen_url} alt={prod.nombre} />
                      ) : (
                        <div className="prod-placeholder">{prod.categorias_tienda?.nombre}</div>
                      )}
                    </div>
                    <div className="prod-info-box">
                      <span className="prod-tag">{prod.categorias_tienda?.nombre}</span>
                      <h4>{prod.nombre}</h4>
                      <div className="prod-price">${(prod.precio_final || 0).toLocaleString('es-CL')}</div>
                      <a href="/tienda" className="btn-shop">
                        <ShoppingCart size={14} />
                        Ver en Tienda
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="carousel-btn prev mini" onClick={prevProd}><ChevronLeft size={20} /></button>
              <button className="carousel-btn next mini" onClick={nextProd}><ChevronRight size={20} /></button>
            </div>
          </section>
        )}

        {/* FLOATING BOOKING CTA */}
        {showBooking && (
          <div className="floating-booking-banner">
            <a href="/tienda" className="booking-link agenda-attention">
              <span className="booking-dot"></span>
              AGENDA TU CLASE
            </a>
            <button onClick={() => setShowBooking(false)} className="close-booking">×</button>
          </div>
        )}

      </main>

      <style jsx global>{`
        :root {
          --nav-height: 95px;
        }
        @media (max-width: 1024px) {
          :root {
            --nav-height: 70px;
          }
        }

        body { 
          margin: 0; 
          padding: 0; 
          overflow-x: hidden;
          background: #fdfcfb;
          font-family: var(--font-archivo), sans-serif;
          color: #0f172a;
        }

        .landing-main {
          width: 100%;
          position: relative;
          margin-top: var(--nav-height);
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          overflow: hidden;
        }

        .hero-video-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
          z-index: 2;
        }



        .hero-content {
          position: relative;
          z-index: 5;
          text-align: center;
          color: #fff;
          padding: 0 20px;
          max-width: 1000px;
          margin-top: 40px;
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }



        .since {
          display: block;
          font-size: 14px;
          letter-spacing: 12px;
          color: #38bdf8;
          margin-bottom: 20px;
          font-weight: 900;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .main-brand-title {
          font-size: clamp(3rem, 12vw, 150px);
          font-weight: 950;
          line-height: 0.85;
          letter-spacing: -0.06em;
          margin: 0 0 30px 0;
          text-transform: uppercase;
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.5));
        }

        .hero-description {
          font-size: clamp(14px, 2.5vw, 20px);
          font-weight: 400;
          color: rgba(255,255,255,0.9);
          margin-bottom: 50px;
          line-height: 1.6;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .btn-pill-premium {
          background: #fff;
          color: #000;
          padding: 12px 30px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .btn-pill-premium:hover {
          transform: translateY(-5px);
          background: #38bdf8;
          color: #fff;
        }

        /* SCROLL HINT */
        .scroll-hint {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 10;
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .mouse {
          width: 22px;
          height: 35px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          position: relative;
        }

        .wheel {
          width: 2px;
          height: 6px;
          background: #38bdf8;
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 2px;
          animation: scroll-wheel 2s infinite;
        }

        @keyframes scroll-wheel {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(15px); opacity: 0; }
        }

        @media (max-width: 768px) {
          .hero-content { margin-top: 40px; }
          .hero-actions { flex-direction: column; gap: 15px; }
          .since { font-size: 10px; letter-spacing: 4px; }
        }

        /* FLOATING BOOKING BANNER */
        .floating-booking-banner {
          position: fixed;
          top: calc(var(--nav-height) + 15px);
          right: 30px;
          z-index: 9999;
          background: #fff;
          display: flex;
          align-items: center;
          padding: 6px 6px 6px 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border-radius: 100px;
          animation: slideInRight 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .booking-link {
          text-decoration: none;
          color: #000;
          font-size: 10.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 15px;
        }

        .booking-dot {
          width: 6px;
          height: 6px;
          background: #38bdf8;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-dot 2s infinite;
        }

        .close-booking {
          background: #f1f5f9;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-size: 18px;
          font-weight: 300;
          transition: all 0.2s;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes attention-pulse {
          0%, 100% { transform: scale(1); text-shadow: 0 0 0px rgba(56, 189, 248, 0); }
          50% { transform: scale(1.03); text-shadow: 0 0 8px rgba(56, 189, 248, 0.4); }
        }

        .agenda-attention {
          color: #38bdf8 !important;
          animation: attention-pulse 2s ease-in-out infinite;
        }

        @media (max-width: 1024px) {
          .floating-booking-banner {
            top: calc(var(--nav-height) + 10px);
            right: 15px;
            padding: 5px 5px 5px 12px;
          }
          .booking-link {
            font-size: 9px;
            letter-spacing: 1px;
            margin-right: 10px;
          }
        }
        /* CAROUSEL STYLES */
        .carousel-section {
          padding: 80px 20px;
          background: #f8fafc;
        }

        .carousel-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          height: 500px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .carousel-track {
          display: flex;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .carousel-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
        }

        .slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 50%);
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .carousel-btn:hover {
          background: #38bdf8;
          border-color: #38bdf8;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-btn.prev { left: 20px; }
        .carousel-btn.next { right: 20px; }

        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: #38bdf8;
        }

        /* FEATURED SECTION */
        .featured-section {
          padding: 100px 20px;
          background: #ffffff;
          text-align: center;
        }

        .section-header {
          margin-bottom: 60px;
        }

        .section-subtitle {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #0ea5e9;
          text-transform: uppercase;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 60px);
          font-weight: 950;
          color: #0f172a;
          margin-top: 10px;
          text-transform: uppercase;
        }

        .content-grid-placeholder {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .glass-card-premium {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 40px;
          border-radius: 24px;
          text-align: left;
          transition: all 0.4s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }

        .card-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }

        .glass-card-premium:hover {
          background: #fff;
          transform: translateY(-10px);
          border-color: #0ea5e9;
          box-shadow: 0 20px 40px rgba(14, 165, 233, 0.1);
        }

        .glass-card-premium h3 {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .glass-card-premium p {
          color: #475569;
          margin-bottom: 25px;
          line-height: 1.6;
          flex: 1;
        }

        /* PRODUCT CAROUSEL */
        .product-carousel-section {
          padding: 100px 20px;
          background: #f8fafc;
          overflow: hidden;
        }

        .product-carousel-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .product-track {
          display: flex;
          gap: 20px;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-slide-card {
          min-width: calc(25% - 15px);
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .product-slide-card:hover {
          border-color: #0ea5e9;
          box-shadow: 0 15px 30px rgba(0,0,0,0.05);
        }

        .prod-img-box {
          height: 250px;
          background: #f1f5f9;
          position: relative;
        }

        .prod-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .prod-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #cbd5e1;
          text-transform: uppercase;
          font-size: 14px;
        }

        .prod-info-box {
          padding: 20px;
        }

        .prod-tag {
          font-size: 10px;
          font-weight: 900;
          color: #0ea5e9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .prod-info-box h4 {
          font-size: 16px;
          font-weight: 800;
          margin: 5px 0 10px 0;
          color: #0f172a;
        }

        .prod-price {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .btn-shop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0f172a;
          color: #fff;
          padding: 10px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
          transition: background 0.2s;
        }

        .btn-shop:hover {
          background: #0ea5e9;
        }

        .carousel-btn.mini {
          width: 40px;
          height: 40px;
          background: #fff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @media (max-width: 1024px) {
          .product-slide-card { min-width: calc(50% - 10px); }
        }

        @media (max-width: 600px) {
          .product-slide-card { min-width: 100%; }
        }

        .btn-link {
          color: #38bdf8;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .carousel-container { height: 300px; }
          .carousel-btn { display: none; }
        }
      `}</style>
    </>
  );
}
