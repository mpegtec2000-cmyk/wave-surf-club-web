'use client';

import Navbar from '@/components/Navbar';
import { Instagram } from 'lucide-react';

export default function TallerPage() {
  return (
    <div className="taller-page">
      <style jsx>{`
        .taller-page {
          min-height: 100vh;
          background: #000;
          color: #fff;
          font-family: var(--font-inter), sans-serif;
        }

        /* --- HERO --- */
        .hero {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #000 0%, transparent 40%, rgba(0,0,0,0.4) 100%);
          z-index: 2;
        }
        .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
        }
        .hero-main-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: clamp(80px, 15vw, 180px);
          font-weight: 900;
          letter-spacing: -5px;
          line-height: 0.8;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .hero-tagline {
          font-size: clamp(14px, 2vw, 20px);
          letter-spacing: 8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          font-weight: 700;
        }

        /* --- INFO SECTION --- */
        .info-section {
          padding: 120px 24px;
          background: #000;
        }
        .max-w-5xl {
          max-width: 1024px;
          margin: 0 auto;
        }
        .header-block {
          margin-bottom: 80px;
        }
        .section-title {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }
        .text-accent { color: #facc15; }
        .section-intro {
          font-size: 20px;
          color: #94a3b8;
          max-width: 700px;
          line-height: 1.5;
        }

        .grid-md-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 60px;
          align-items: center;
        }
        .text-content {
          font-size: 18px;
          line-height: 1.8;
          color: #cbd5e1;
          font-weight: 300;
        }
        .bio-highlight {
          color: #fff;
          font-weight: 700;
        }

        .shaper-card {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .shaper-card img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          display: block;
        }
        .shaper-info {
          padding: 32px;
          background: linear-gradient(to top, #111 20%, transparent);
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        .shaper-name { font-weight: 900; font-size: 24px; }
        .shaper-role { color: #facc15; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }

        .ig-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 28px;
          background: #fff;
          color: #000;
          border-radius: 100px;
          font-weight: 900;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.3s;
          margin-top: 40px;
        }
        .ig-link:hover {
          transform: translateY(-5px);
          background: #facc15;
        }

        /* --- STATS --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-top: 100px;
          padding-top: 60px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .stat-item h4 {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 8px;
          color: #facc15;
        }
        .stat-item p {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .hero-main-title { font-size: 60px; letter-spacing: -2px; }
          .grid-md-2 { grid-template-columns: 1fr; gap: 40px; }
        }
      `}</style>
      
      <Navbar />
      
      <section className="hero">
        <img 
          src="/FONDO TALLER.jpg" 
          alt="Taller Wave Surf Club"
          className="hero-img"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-main-title">TALLER</h1>
          <p className="hero-tagline">Crafting the Future of Surfing</p>
        </div>
      </section>

      <section className="info-section">
        <div className="max-w-5xl mx-auto">
          
          <div className="header-block">
            <h2 className="section-title">
              Taller <span className="text-accent">&</span> Modelado
            </h2>
            <p className="section-intro">
              El corazón técnico de Wave Surf Club Pichilemu, liderado por nuestro Shaper Matías Espinoza.
            </p>
          </div>

          <div className="grid-md-2">
            <div className="text-content space-y-6">
              <p>
                Nuestra visión es la <span className="bio-highlight">sostenibilidad real</span>. 
                Cada tabla que sale de nuestro taller es una pieza de ingeniería diseñada para las exigentes olas chilenas, 
                utilizando materiales de la más alta calidad y un proceso de modelado que combina tecnología CNC con el refinamiento manual.
              </p>
              <p>
                Especializados en <span className="bio-highlight">EPS y Resina Epoxy</span>,
                buscamos reducir la huella de carbono sin comprometer el performance. 
                No solo reparamos equipos, creamos las herramientas definitivas para tu progresión en el agua.
              </p>
              
              <a href="https://instagram.com/matespinozasurfboards" target="_blank" rel="noopener noreferrer" className="ig-link">
                <Instagram size={18} />
                Sigue el Proceso
              </a>
            </div>

            <div className="shaper-card">
              <img src="/LOGO TALLER.jpg" alt="Matías Espinoza Shaper" />
              <div className="shaper-info">
                <p className="shaper-role">Master Shaper</p>
                <h3 className="shaper-name">MATÍAS ESPINOZA</h3>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <h4>10+</h4>
              <p>Años Experience</p>
            </div>
            <div className="stat-item">
              <h4>500+</h4>
              <p>Boards Crafted</p>
            </div>
            <div className="stat-item">
              <h4>PRO</h4>
              <p>Performance level</p>
            </div>
            <div className="stat-item">
              <h4>100%</h4>
              <p>Hand Finished</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px' }}>WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
