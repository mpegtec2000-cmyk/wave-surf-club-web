'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Instagram } from 'lucide-react';

const workshopImages = [
  '/Taller/2.jpg',
  '/Taller/3.jpg',
  '/Taller/4.jpg',
  '/Taller/5.jpg',
  '/Taller/6.jpg',
  '/Taller/7.jpg',
  '/Taller/8.jpg'
];

export default function TallerPage() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % workshopImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taller-page">
      <Navbar />
      
      {/* HERO SECTION - Full Height, No Title, No Overlay */}
      <section className="hero">
        <Image 
          src="/FONDO TALLERR.jpg" 
          alt="Taller Wave Surf Club Workshop"
          fill
          priority
          className="hero-img"
        />
      </section>

      {/* RESTORED CONTENT SECTION */}
      <section className="info-section">
        <div className="max-w-5xl mx-auto">
          
          {/* Encabezado Estilo Wave - Sin Título Principal */}
          <div className="header-block">
            <p className="section-intro">
              El corazón técnico de Wave Surf Club Pichilemu, liderado por nuestro Shaper Matías Espinoza.
            </p>
          </div>

          {/* Historia y Biografía */}
          <div className="content-grid">
            <div className="text-block">
              <p>
                Nuestra visión es la <strong className="text-white">sostenibilidad real</strong>. 
                Fabricamos tablas con madera de Agave, una planta introducida en Chile que nos permite crear equipos de alto rendimiento con impacto ambiental cero.
              </p>
              <p className="quote">
                "Mi meta es que cuando se acabe la vida útil de la tabla, pueda ser compostada y en un año vuelva a la tierra." 
                <br/><span className="author">— Matías Espinoza.</span>
              </p>
            </div>

            {/* Enlace Destacado al Instagram Secundario */}
            <div className="social-card">
              <Instagram size={48} className="icon-accent" />
              <h3 className="card-title">Sigue el Proceso</h3>
              <p className="card-text">
                Mira la recolección de Agave y el shaping paso a paso en nuestra cuenta especializada.
              </p>
              <a 
                href="https://www.instagram.com/wavesurfclub_pichilemu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="insta-btn"
              >
                @wavesurfclub_pichilemu
              </a>
            </div>
          </div>

          {/* NUEVA BARRA DE COTIZACIÓN - WhatsApp Matías */}
          <div className="quote-bar">
            <div className="quote-content">
              <div className="quote-text">
                <h3>¿NECESITAS REPARAR TU TABLA?</h3>
                <p>Cotiza directamente con Matías Espinoza, nuestro shaper experto.</p>
              </div>
              <a 
                href="https://wa.me/56940674889?text=Hola%20Matías%2C%20necesito%20cotizar%20una%20reparación%20para%20mi%20tabla." 
                target="_blank" 
                className="quote-whatsapp"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                COTIZAR REPARACIÓN
              </a>
            </div>
          </div>

          {/* --- SECCIÓN DE TRABAJO Y FILOSOFÍA (2 COLUMNAS) --- */}
          <div className="work-display-grid">
            {/* Columna Izquierda: Carrusel Vertical */}
            <div className="carousel-column">
              <h3 className="section-title">PROCESO Y TRABAJO</h3>
              <div className="carousel-frame vertical">
                {workshopImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`carousel-slide ${idx === currentIdx ? 'active' : ''}`}
                  >
                    <Image 
                      src={img} 
                      alt="Trabajo en Taller" 
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {workshopImages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`dot ${idx === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Columna Derecha: Video Filosofía */}
            <div className="video-column">
              <h3 className="section-title">FILOSOFÍA DEL PROYECTO</h3>
              <div className="video-frame">
                <iframe 
                  src="https://www.instagram.com/p/DHGdS7BMufO/embed" 
                  width="100%" 
                  height="700" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowtransparency="true"
                  style={{ display: 'block' }}
                ></iframe>
              </div>
            </div>
          </div>
      </section>

      <footer>
        WAVE SURF CLUB © 2026 — PICHILEMU WORKSHOP
      </footer>

      <style jsx>{`
        .taller-page {
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family: var(--font-archivo), sans-serif;
        }

        /* --- HERO --- */
        .hero {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* --- INFO SECTION --- */
        .info-section {
          padding: 100px 20px;
          background: #000;
        }
        .header-block { margin-bottom: 80px; }
        .text-accent { color: #38bdf8; }
        .section-intro {
          font-size: 20px;
          color: #94a3b8;
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }

        .text-block {
          font-size: 18px;
          line-height: 1.8;
          color: #cbd5e1;
          font-weight: 300;
        }
        .text-white { color: #fff; font-weight: 800; }
        .quote {
          margin-top: 40px;
          border-left: 3px solid #38bdf8;
          padding-left: 20px;
          font-style: italic;
          color: #fff;
        }
        .author {
          display: block;
          margin-top: 10px;
          font-size: 14px;
          font-style: normal;
          color: #38bdf8;
          font-weight: 800;
          text-transform: uppercase;
        }

        .social-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 60px 40px;
          border-radius: 24px;
          text-align: center;
          transition: all 0.4s;
        }
        .social-card:hover {
          border-color: #38bdf8;
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(56, 189, 248, 0.1);
        }
        .icon-accent { color: #38bdf8; margin-bottom: 24px; }
        .card-title { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .card-text { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
        
        .insta-btn {
          display: inline-block;
          background: #fff;
          color: #000;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 900;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        .insta-btn:hover {
          background: #38bdf8;
          transform: scale(1.05);
        }

        footer {
          text-align: center;
          padding: 60px 0;
          font-size: 10px;
          letter-spacing: 4px;
          color: #334155;
          border-top: 1px solid #111;
        }

        /* --- QUOTE BAR --- */
        .quote-bar {
          margin-top: 80px;
          background: linear-gradient(90deg, #0a0a0a, #111);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 20px;
          padding: 30px 50px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
        }
        .quote-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }
        .quote-text h3 {
          font-size: 20px;
          font-weight: 950;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .quote-text p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }
        .quote-whatsapp {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #25d366;
          color: #fff;
          padding: 16px 30px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          transition: transform 0.3s;
          white-space: nowrap;
        }
        .quote-whatsapp:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
        }

        @media (max-width: 768px) {
          .quote-content {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }
          .quote-bar {
            padding: 30px 20px;
          }
          .quote-whatsapp {
            width: 100%;
            justify-content: center;
          }
        }



        /* --- WORK DISPLAY GRID --- */
        .work-display-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-top: 100px;
          align-items: start;
        }
        .section-title {
          font-size: 12px;
          letter-spacing: 6px;
          color: #38bdf8;
          margin-bottom: 40px;
          font-weight: 900;
          text-align: center;
        }
        .carousel-frame.vertical {
          height: 700px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .video-frame {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.05);
          background: #0a0a0a;
        }

        /* --- CAROUSEL --- */
        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
          transform: scale(1.1);
        }
        .carousel-slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.3s;
        }
        .dot.active {
          background: #38bdf8;
          width: 24px;
          border-radius: 10px;
        }

        @media (max-width: 1024px) {
          .work-display-grid {
            grid-template-columns: 1fr;
            gap: 80px;
          }
          .hero {
            height: 60vh;
          }
          .info-section {
            padding: 60px 20px;
          }
          .carousel-frame.vertical {
            height: 500px;
          }
        }
      `}</style>
    </div>
  );
}
