'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SPOTS_DATA } from '@/lib/spots-data';
import Navbar from '@/components/Navbar';

export default function SpotPage() {
  const params = useParams();
  const slug = params.slug;
  const spot = SPOTS_DATA[slug];

  if (!spot) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#fff' }}>
        <h2>Spot no encontrado</h2>
        <Link href="/" style={{ marginLeft: 20, color: '#38bdf8' }}>Volver</Link>
      </div>
    );
  }

  return (
    <div className="spot-magazine">
      <Navbar />

      {/* A. Hero: Pantalla Completa */}
      <section className="spot-hero" style={{ backgroundImage: `url(${spot.heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{spot.name.toUpperCase()}</h1>
          <p className="hero-sub">{spot.subtitle}</p>
        </div>
      </section>

      {/* B. Ficha Técnica / Grid Inmobiliario */}
      <section className="spot-technical">
        <div className="tech-container">
          <div className="tech-desc">
            <h2>El Activo</h2>
            <p>{spot.description}</p>
            <div className="stats-box">
              <div className="stat"><span>Superficie</span> <strong>{spot.stats.area}</strong></div>
              <div className="stat"><span>Capacidad</span> <strong>{spot.stats.capacity}</strong></div>
              <div className="stat"><span>Destacado</span> <strong>{spot.stats.features}</strong></div>
            </div>
            
            <h3>Amenities</h3>
            <ul className="amenities-list">
              {spot.amenities.map((am, i) => (
                <li key={i}>
                  <strong>{am.title}</strong>
                  {am.desc}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="tech-map">
            <iframe 
              src={spot.mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '12px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* C. Galería de Experiencia (Lookbook) */}
      <section className="spot-gallery">
        <h2>Lookbook de Experiencia</h2>
        <div className="gallery-grid">
          {spot.gallery.map((img, i) => (
            <div key={i} className="gallery-item" style={{ backgroundImage: `url(${img})` }}></div>
          ))}
        </div>
      </section>

      {/* D. Call to Action Inmobiliario */}
      <section className="spot-cta">
        <h2>¿Listo para vivir la experiencia?</h2>
        <p>Garantiza tu espacio en {spot.name}</p>
        <Link href="/#hero" className="btn-cta">SOLICITAR MEMBRESÍA</Link>
      </section>

      <style jsx>{`
        .spot-magazine {
          background: #0b1120;
          color: #f8fafc;
          min-height: 100vh;
          font-family: var(--font-inter), sans-serif;
        }

        /* Hero Fullscreen */
        .spot-hero {
          height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11, 17, 32, 0.3) 0%, rgba(11, 17, 32, 1) 100%);
        }
        .hero-content {
          position: relative;
          z-index: 10;
          padding: 20px;
        }
        .hero-content h1 {
          font-family: var(--font-playfair), serif;
          font-size: clamp(60px, 10vw, 120px);
          font-weight: 800;
          letter-spacing: -3px;
          margin: 0 0 16px 0;
          text-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .hero-sub {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: clamp(20px, 3vw, 36px);
          color: #38bdf8;
          max-width: 800px;
          margin: 0 auto;
          text-shadow: 0 4px 15px rgba(0,0,0,0.9);
        }

        /* Tech Container */
        .spot-technical {
          padding: 120px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .tech-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .tech-desc h2 {
          font-family: var(--font-playfair), serif;
          font-size: 48px;
          margin-bottom: 30px;
          color: #f8fafc;
        }
        .tech-desc p {
          color: #94a3b8;
          font-size: 18px;
          line-height: 1.8;
          margin-bottom: 50px;
        }
        
        .stats-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 60px;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 40px 0;
        }
        .stat { display: flex; flex-direction: column; gap: 8px; }
        .stat span { color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; }
        .stat strong { color: #f8fafc; font-size: 22px; font-weight: 700; font-family: var(--font-playfair), serif; }

        .tech-desc h3 {
          font-family: var(--font-playfair), serif;
          font-size: 32px;
          margin-bottom: 30px;
        }
        .amenities-list { list-style: none; padding: 0; margin: 0; }
        .amenities-list li {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 16px;
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.6;
        }
        .amenities-list li strong { color: #f8fafc; display: block; font-size: 18px; margin-bottom: 8px; font-family: var(--font-playfair), serif; }

        .tech-map {
          background: rgba(255,255,255,0.01);
          border-radius: 24px;
          padding: 10px;
          height: 700px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          position: sticky;
          top: 120px;
        }

        /* Gallery */
        .spot-gallery {
          padding: 120px 20px;
          background: rgba(15, 23, 42, 0.4);
          text-align: center;
        }
        .spot-gallery h2 {
          font-family: var(--font-playfair), serif;
          font-size: 48px;
          margin-bottom: 60px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .gallery-item {
          height: 600px;
          background-size: cover;
          background-position: center;
          border-radius: 16px;
          transition: transform 0.5s ease;
        }
        .gallery-item:hover {
          transform: scale(1.02);
        }

        /* CTA */
        .spot-cta {
          padding: 150px 20px;
          text-align: center;
          background: linear-gradient(to top, rgba(11, 17, 32, 1), rgba(15, 23, 42, 0));
        }
        .spot-cta h2 {
          font-family: var(--font-playfair), serif;
          font-size: 56px;
          margin-bottom: 20px;
        }
        .spot-cta p {
          color: #94a3b8;
          font-size: 22px;
          margin-bottom: 50px;
        }
        .btn-cta {
          display: inline-block;
          background: #38bdf8;
          color: #0b1120;
          padding: 24px 60px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 2px;
          text-decoration: none;
          transition: all 0.3s;
        }
        .btn-cta:hover {
          background: #f8fafc;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(56, 189, 248, 0.3);
        }

        @media (max-width: 1024px) {
          .tech-container { grid-template-columns: 1fr; gap: 40px; }
          .tech-map { height: 400px; position: static; }
          .gallery-grid { grid-template-columns: 1fr; }
          .gallery-item { height: 400px; }
          .stats-box { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
