'use client';

<<<<<<< HEAD
import Link from 'next/link';
import Image from 'next/image';

export default function TallerPage() {
  return (
    <div className="taller-container">
      <style jsx>{`
        .taller-container {
          min-height: 100vh;
          background: #0b1120;
          color: #f8fafc;
          font-family: var(--font-inter), sans-serif;
          overflow-x: hidden;
        }

        /* --- NAVBAR --- */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 40px;
          height: 80px;
          background: rgba(11, 17, 32, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .back-link {
          color: #fff;
          text-decoration: none;
          font-family: var(--font-archivo), sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }
        .back-link:hover {
          color: #38bdf8;
          transform: translateX(-5px);
        }

        /* --- HERO SECTION --- */
        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
=======
import Navbar from '@/components/Navbar';
import { Instagram } from 'lucide-react';

export default function TallerPage() {
  return (
    <div className="taller-page">
      <Navbar />
      
      {/* HERO SECTION - Full Height */}
      <section className="hero">
        <img 
          src="/FONDO TALLER.jpg" 
          alt="Taller Wave Surf Club"
          className="hero-img"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-main-title">TALLER</h1>
          <p className="hero-tagline">Wave Surf Club</p>
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
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
<<<<<<< HEAD
          background: linear-gradient(to bottom, rgba(11, 17, 32, 0.4), #0b1120);
          z-index: 2;
        }
        .hero-content {
          position: relative;
          z-index: 3;
          max-width: 900px;
          padding: 0 20px;
        }
        .name-img {
          height: 120px;
          width: auto;
          margin-bottom: 20px;
          filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.3));
        }
        .hero-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: clamp(40px, 8vw, 100px);
          font-weight: 900;
          line-height: 0.9;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: -4px;
        }
        .hero-subtitle {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: clamp(18px, 3vw, 24px);
          color: #38bdf8;
          margin-bottom: 40px;
        }

        /* --- CONTENT SECTIONS --- */
        .sections-wrapper {
          position: relative;
          z-index: 4;
          padding: 100px 0;
          background: #0b1120;
        }
        .grid-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 60px;
          padding: 0 40px;
        }
        .info-card {
          padding: 40px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: all 0.4s;
        }
        .info-card:hover {
          border-color: #38bdf8;
          transform: translateY(-10px);
        }
        .card-label {
          font-family: var(--font-archivo), sans-serif;
          font-size: 11px;
          font-weight: 900;
          color: #38bdf8;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .card-title {
          font-family: var(--font-playfair), serif;
          font-size: 32px;
          margin-bottom: 20px;
        }
        .card-text {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 16px;
        }

        /* --- CONTACT CTA --- */
        .cta-section {
          padding: 150px 0;
          text-align: center;
          background: #0b1120;
        }
        .cta-btn {
          display: inline-block;
          background: #38bdf8;
          color: #0b1120;
          font-family: var(--font-archivo), sans-serif;
          font-size: 14px;
          font-weight: 900;
          padding: 20px 40px;
          border-radius: 50px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        .cta-btn:hover {
          background: #fff;
          transform: scale(1.05);
        }
      `}</style>

      {/* CABECERA (Nav minimalista de retorno) */}
      <header className="header">
        <Link href="/" className="back-link">
          ← Volver al Inicio
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg">
          <Image 
            src="/paulo-1.png" 
            alt="Paulo Muñoz Taller" 
            fill 
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <img src="/paulo-name.png" alt="Paulo Muñoz" className="name-img" />
          <h1 className="hero-title">EL ARTE DE LA REPARACIÓN</h1>
          <p className="hero-subtitle">Premium Surfboard Restoration & Customization</p>
        </div>
      </section>

      {/* SECCIONES DE INFORMACIÓN */}
      <div className="sections-wrapper">
        <div className="grid-container">
          <div className="info-card">
            <div className="card-label">01 / SHAPER</div>
            <h3 className="card-title">Maestría en Resina</h3>
            <p className="card-text">
              Paulo Muñoz es uno de los shapers más respetados de la zona central. Con décadas de experiencia bajo el brazo, su taller no solo repara tablas, sino que las devuelve a su estado original de performance.
            </p>
          </div>

          <div className="info-card">
            <div className="card-label">02 / SERVICES</div>
            <h3 className="card-title">Custom Crafting</h3>
            <p className="card-text">
              Desde reparaciones estructurales de fibra de carbono hasta acabados en resina tintada. Cada detalle es tratado como una pieza única de ingeniería náutica.
            </p>
          </div>

          <div className="info-card">
            <div className="card-label">03 / PERFORMANCE</div>
            <h3 className="card-title">Tuning de Quillas</h3>
            <p className="card-text">
              Optimización de sistemas de quillas, refuerzos en caja y balanceo de peso para que tu tabla rinda al máximo en el agua.
            </p>
          </div>
        </div>

        <section className="cta-section">
          <h2 className="hero-title" style={{ fontSize: '40px', marginBottom: '30px' }}>¿TU TABLA NECESITA AMOR?</h2>
          <a href="/#contacto" className="cta-btn">Agendar Reparación</a>
        </section>
      </div>

      <footer style={{ textAlign: 'center', paddingBottom: '60px', opacity: 0.3, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px' }}>
        Wave Surf Club © 2026 — Master Workshop 
      </footer>
=======
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9));
        }
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
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
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
    </div>
  );
}
