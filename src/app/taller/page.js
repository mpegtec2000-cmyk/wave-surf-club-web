'use client';

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
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
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
    </div>
  );
}
