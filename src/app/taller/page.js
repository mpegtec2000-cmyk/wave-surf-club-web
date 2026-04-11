'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Instagram } from 'lucide-react';

export default function TallerPage() {
  return (
    <div className="taller-page">
      <Navbar />
      
      {/* HERO SECTION - Full Height */}
      <section className="hero">
        <Image 
          src="/paulo-1.png" 
          alt="Taller Wave Surf Club"
          fill
          priority
          className="hero-img"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-main-title">TALLER & MODELADO</h1>
          <p className="hero-tagline">Crafting the Future of Surfing</p>
        </div>
      </section>

      {/* NEW CONTENT SECTION - Based on user prompt */}
      <section className="info-section">
        <div className="max-w-5xl mx-auto">
          
          {/* Encabezado Estilo Wave */}
          <div className="header-block">
            <h2 className="section-title">
              Taller <span className="text-accent">&</span> Modelado
            </h2>
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
        </div>

        {/* Sección de Video Instagram - Matías Espinoza */}
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '12px', letterSpacing: '6px', marginBottom: '40px', textTransform: 'uppercase', fontWeight: 900 }}>FILOSOFÍA DEL PROYECTO</h3>
          <div style={{ 
            maxWidth: '540px', 
            margin: '0 auto', 
            borderRadius: '24px', 
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <iframe 
              src="https://www.instagram.com/p/DHGdS7BMufO/embed" 
              width="100%" 
              height="650" 
              frameBorder="0" 
              scrolling="no" 
              allowtransparency="true"
              style={{ display: 'block' }}
            ></iframe>
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
          height: calc(100vh - var(--nav-height));
          margin-top: var(--nav-height);
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
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9));
        }
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 20px;
        }
        @media (max-width: 1024px) {
          .hero-content {
            padding-top: 100px;
          }
        }
        .hero-main-title {
          font-size: clamp(40px, 8vw, 120px);
          font-weight: 900;
          letter-spacing: -4px;
          line-height: 0.9;
          margin: 0;
          text-transform: uppercase;
        }
        .hero-tagline {
          font-size: 14px;
          letter-spacing: 8px;
          color: #38bdf8;
          text-transform: uppercase;
          margin-top: 20px;
          font-weight: 800;
        }

        @media (max-width: 1024px) {
          .hero {
            height: calc(85vh - var(--nav-height));
            margin-top: var(--nav-height);
          }
          .hero-main-title {
            font-size: clamp(32px, 12vw, 64px);
            letter-spacing: -2px;
          }
          .hero-tagline {
            font-size: 10px;
            letter-spacing: 4px;
          }
          .info-section {
            padding: 60px 20px !important;
          }
          .header-block {
            margin-bottom: 40px !important;
          }
          .section-title {
            font-size: 32px !important;
          }
          .content-grid {
            gap: 30px !important;
          }
        }

        /* --- INFO SECTION --- */
        .info-section {
          padding: 100px 20px;
          background: #000;
        }
        .header-block { margin-bottom: 80px; }
        .section-title {
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -2px;
          margin-bottom: 16px;
        }
        .text-accent { color: #38bdf8; }
        .section-intro {
          font-size: 20px;
          color: #94a3b8;
          max-width: 700px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
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
      `}</style>
    </div>
  );
}
