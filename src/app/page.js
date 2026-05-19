'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';
import { ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';
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
    
    // Timer for image carousel
    const heroTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);

    return () => clearInterval(heroTimer);
  }, []);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from('productos_tienda')
      .select('id, nombre, precio, precio_final, imagen_url, destacado, categorias_tienda(nombre, slug)')
      .eq('activo', true)
      .eq('destacado', true)
      .limit(8);
    if (data) setProductos(data);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  return (
    <>
      <Navbar />
      <main className="landing-main">
        <div id="hero" className="hero-section">

          <div 
            className="hero-video-wrapper"
            dangerouslySetInnerHTML={{
              __html: `
                <video 
                  autoplay="autoplay" 
                  loop="loop" 
                  muted="muted" 
                  playsinline="playsinline" 
                  preload="auto"
                  class="hero-video"
                >
                  <source src="/videos/fondo-wave.mp4?v=3" type="video/mp4" />
                </video>
              `
            }}
          />

          <div className="hero-content">
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

        {/* SOBRE NOSOTROS SECTION */}
        <section className="about-us-section">
          <div className="container-premium">
            <div className="about-header-centered">
              <span className="section-subtitle">NUESTRA HISTORIA</span>
              <h2 className="section-title">SOMOS WAVE SURF CLUB</h2>
            </div>
            
            <div className="about-grid-professional">
              <div className="about-text-content">
                <p className="about-description-large">
                  Fundado en 2015, Wave Surf Club nació de la visión de crear un espacio donde la técnica y la pasión por el mar se encuentran. 
                  Ubicados en la costa central de Chile, nos hemos consolidado como referentes en la enseñanza del surf y el skate, 
                  enfocándonos en la excelencia deportiva y el respeto por el océano.
                </p>
                
                <div className="sucursales-list-pro">
                  <div className="sucursal-item">
                    <div className="s-line"></div>
                    <div className="s-content">
                      <h4>SEDE CONCÓN</h4>
                      <p>Centro de formación integral y base operativa de nuestras principales escuelas.</p>
                    </div>
                  </div>
                  <div className="sucursal-item">
                    <div className="s-line"></div>
                    <div className="s-content">
                      <h4>SEDE PICHILEMU</h4>
                      <p>Capital mundial del surf, nuestra sede para sesiones de alto rendimiento y conexión profunda con el mar.</p>
                    </div>
                  </div>
                  <div className="sucursal-item">
                    <div className="s-line"></div>
                    <div className="s-content">
                      <h4>SEDE PUNTA DE PIEDRA</h4>
                      <p>Un spot estratégico para clases personalizadas y una experiencia técnica de nivel superior.</p>
                    </div>
                  </div>
                </div>

                <div className="about-actions-centered">
                  <a href="/escuelas" className="btn-luxury">Explorar Escuelas</a>
                </div>
              </div>

              <div className="about-visual-pro">
                <div className="gif-premium-container">
                  {/* Contenedor optimizado para GIF de alta calidad */}
                  <img 
                    src="/GIFS/promo-surf.gif" 
                    alt="Wave Surf Experience" 
                    className="promo-gif"
                    onError={(e) => { e.target.src = '/CARUSEL/1.jpg'; }}
                  />
                  <div className="gif-border-frame"></div>
                </div>
                
                <div className="stats-pill-floating">
                  <div className="stat-unit"><strong>09</strong><span>AÑOS</span></div>
                  <div className="stat-unit"><strong>+5K</strong><span>ALUMNOS</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IMAGE CAROUSEL SECTION */}
        <section className="carousel-section">
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {CAROUSEL_IMAGES.map((img, index) => (
                <div key={index} className="carousel-slide">
                  <Image 
                    src={img} 
                    alt={`Slide ${index + 1}`} 
                    fill 
                    style={{ objectFit: 'cover' }}
                    priority={index === 0}
                  />
                  <div className="slide-overlay"></div>
                </div>
              ))}
            </div>
            
            <button className="carousel-btn prev" onClick={prevSlide}><ChevronLeft size={30} /></button>
            <button className="carousel-btn next" onClick={nextSlide}><ChevronRight size={30} /></button>
            
            <div className="carousel-dots">
              {CAROUSEL_IMAGES.map((_, index) => (
                <button 
                  key={index} 
                  className={`dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>




        {/* PRODUCT GRID SECTION */}
        {productos.length > 0 && (
          <section className="product-grid-section">
            <div className="container-premium">
              <div className="section-header">
                <span className="section-subtitle">WAVE SHOP</span>
                <h2 className="section-title">PRODUCTOS DESTACADOS</h2>
              </div>
              
              <div className="product-showcase-grid">
                {productos.map((prod) => (
                  <div key={prod.id} className="product-grid-card">
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
              
              <div className="grid-footer">
                <a href="/tienda" className="btn-view-all">Ver toda la tienda</a>
              </div>
            </div>
          </section>
        )}

        {/* FLOATING BOOKING CTA */}
        {showBooking && (
          <div className="floating-booking">
            <button className="close-booking" onClick={() => setShowBooking(false)}><X size={14} /></button>
            <a href="/escuelas" className="booking-content">
              <span className="dot-live"></span>
              AGENDA TU CLASE
            </a>
          </div>
        )}

        {/* FLOATING DISCOUNT BADGE (PILL STYLE) */}
        <div className="floating-discount-pill">
          <div className="pill-content">
            <span className="dot-blue"></span>
            <div className="pill-text">
              <strong>DESCUENTO ESPECIAL:</strong> 20% OFF para Estudiantes y Extranjeros. Regístrate y recibe tu código exclusivo para reservar.
            </div>
          </div>
        </div>



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

        /* SOBRE NOSOTROS SECTION PROFESSIONAL */
        .about-us-section {
          padding: 120px 0;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
        }

        .about-header-centered {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 80px;
        }

        .about-header-centered .section-title {
          font-family: var(--font-playfair), serif;
          font-size: clamp(2.5rem, 6vw, 60px);
          font-weight: 900;
          letter-spacing: -1px;
          font-style: italic;
        }

        .about-grid-professional {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
        }

        .about-text-content {
          max-width: 550px;
        }

        .about-description-large {
          font-size: 20px;
          color: #475569;
          line-height: 1.8;
          margin-bottom: 50px;
          font-weight: 300;
        }

        .sucursales-list-pro {
          margin-bottom: 50px;
        }

        .sucursal-item {
          display: flex;
          gap: 25px;
          margin-bottom: 35px;
        }

        .s-line {
          width: 2px;
          background: #38bdf8;
          height: 50px;
          flex-shrink: 0;
        }

        .s-content h4 {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0 0 8px;
          color: #0f172a;
        }

        .s-content p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        .btn-luxury {
          display: inline-block;
          padding: 18px 45px;
          background: #0f172a;
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          font-size: 12px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 3px;
          transition: all 0.3s;
        }

        .btn-luxury:hover {
          background: #38bdf8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 189, 248, 0.2);
        }

        .about-visual-pro {
          position: relative;
        }

        .gif-premium-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 20px 20px 0px #f8fafc;
        }

        .promo-gif {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gif-border-frame {
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          pointer-events: none;
        }

        .stats-pill-floating {
          position: absolute;
          bottom: -40px;
          right: -40px;
          background: #fff;
          padding: 30px;
          display: flex;
          gap: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }

        .stat-unit {
          text-align: center;
        }

        .stat-unit strong {
          display: block;
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }
        .stat-unit span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #64748b;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .about-grid-professional { grid-template-columns: 1fr; gap: 80px; }
          .stats-pill-floating { position: static; margin-top: 40px; justify-content: center; }
          .gif-premium-container { box-shadow: none; }
          .about-header-centered { margin-bottom: 40px; }
        }

        .container-premium {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 30px;
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
          height: 600px;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
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

        /* FLOATING DISCOUNT PILL */
        .floating-discount-pill {
          position: fixed;
          bottom: 30px;
          left: 30px;
          z-index: 1000;
          max-width: 450px;
        }

        .pill-content {
          background: #fff;
          padding: 12px 25px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.05);
          animation: float-pill 4s ease-in-out infinite;
        }

        @keyframes float-pill {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .dot-blue {
          width: 10px;
          height: 10px;
          background: #38bdf8;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        }

        .pill-text {
          color: #000;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.4;
        }

        .pill-text strong {
          font-weight: 900;
          margin-right: 5px;
        }

        @media (max-width: 768px) {
          .floating-discount-pill {
            left: 20px;
            right: 20px;
            bottom: 20px;
            max-width: none;
          }
          .pill-text { font-size: 9px; }
        }

        .carousel-dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
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



        /* SECTION HEADERS */
        .section-header {
          margin-bottom: 60px;
          text-align: center;
        }

        .section-subtitle {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #0ea5e9;
          text-transform: uppercase;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 50px);
          font-weight: 950;
          color: #0f172a;
          margin-top: 10px;
          text-transform: uppercase;
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

        /* PRODUCT GRID DISPLAY */
        .product-grid-section {
          padding: 100px 20px;
          background: #f8fafc;
        }

        .product-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }

        .product-grid-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }

        .product-grid-card:hover {
          transform: translateY(-10px);
          border-color: #0ea5e9;
          box-shadow: 0 20px 40px rgba(14, 165, 233, 0.1);
        }

        .grid-footer {
          text-align: center;
        }

        .btn-view-all {
          display: inline-block;
          padding: 16px 40px;
          background: #0f172a;
          color: #fff;
          text-decoration: none;
          border-radius: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .btn-view-all:hover {
          background: #0ea5e9;
          transform: scale(1.05);
        }

        .product-slide-card:hover {
          border-color: #0ea5e9;
          box-shadow: 0 15px 30px rgba(0,0,0,0.05);
        }

        .prod-img-box {
          height: 180px;
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
          width: 44px;
          height: 44px;
          background: #fff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          top: 40%;
        }

        .carousel-btn.mini.prev { left: -22px; }
        .carousel-btn.mini.next { right: -22px; }

        @media (max-width: 1280px) {
          .carousel-btn.mini.prev { left: 10px; }
          .carousel-btn.mini.next { right: 10px; }
        }

        @media (max-width: 1024px) {
          .product-slide-card { min-width: calc((100% - 24px) / 2); }
          .carousel-container { height: 400px; }
        }

        @media (max-width: 600px) {
          .product-slide-card { min-width: 100%; }
          .carousel-container { height: 300px; }
          .carousel-btn.mini { display: none; }
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
