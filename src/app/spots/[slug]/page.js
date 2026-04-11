'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SPOTS_DATA } from '@/lib/spots-data';
import Navbar from '@/components/Navbar';

export default function SpotPage() {
  const params = useParams();
  const slug = params.slug;
  const spot = SPOTS_DATA[slug];

  if (!spot) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
        <h2>Spot no encontrado</h2>
        <Link href="/" style={{ marginLeft: 20, color: '#38bdf8' }}>Volver</Link>
      </div>
    );
  }

  const formatSpaced = (text) => text.toUpperCase();

  return (
    <div className="spot-magazine">
      <Navbar />

      {/* A. Hero: High-Impact Editorial Style */}
      <header className="mag-hero">
        <Image 
          src={spot.heroImage}
          alt={spot.name}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="hero-bg-img"
        />
        <div className="hero-gradient-overlay" />
        <div className="hero-title-box">
          <span className="mag-tag">DESTINATION</span>
          <h1 className="mag-name">
            <span className="mag-prefix">S P O T</span> 
            <span>/</span>
            <span>{formatSpaced(spot.name)}</span>
          </h1>
        </div>
      </header>

      {/* B. Content: Editorial Row Style */}
      <main className="mag-content">
        <div className="editorial-row">
          <div className="text-col">
            <h2 className="editorial-title">
              {slug === 'concon' ? 'ESCUELA CONCON' : 'EL ACTIVO'}
            </h2>
            <div className="editorial-p">
              {spot.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* STATS GRID - From Rider Style */}
            <div className="stats-grid">
              <div className="stat-item">
                <h6>UBICACIÓN</h6>
                <p>{spot.stats.area}</p>
              </div>
              <div className="stat-item">
                <h6>CAPACIDAD</h6>
                <p>{spot.stats.capacity}</p>
              </div>
              <div className="stat-item">
                <h6>HIGHLIGHTS</h6>
                <p>{spot.stats.features}</p>
              </div>
              {spot.instagramUrl && (
                <div className="stat-item">
                  <h6>INSTAGRAM</h6>
                  <p>
                    <a href={spot.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                      @FOLLOW
                    </a>
                  </p>
                </div>
              )}
            </div>
            
            <div className="amenities-container">
              <h3 className="editorial-title" style={{ fontSize: '24px', marginTop: '60px' }}>PREMIUM AMENITIES</h3>
              <div className="amenities-grid">
                {spot.amenities.map((am, i) => (
                  <div key={i} className="amenity-card">
                    <strong>{am.title}</strong>
                    <p>{am.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="img-col sticky-col">
            <div className="tech-map-premium">
              <iframe 
                src={spot.mapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* C. Instagram Content: Premium Sessions Style */}
        {spot.instagramVideos && spot.instagramVideos.length > 0 && (
          <section className="mag-social-vids">
            <span className="sessions-label">LATEST SESSIONS</span>
            <div className="social-vids-grid">
              {spot.instagramVideos.map((url, i) => (
                <div key={i} className="instagram-premium-box">
                  <iframe 
                    src={`${url}embed`} 
                    width="100%" 
                    height="650" 
                    frameBorder="0" 
                    scrolling="no" 
                    allowtransparency="true"
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* D. Experience Lookbook */}
        <section className="mag-gallery-section">
          <h2 className="editorial-title" style={{ textAlign: 'center', marginBottom: '60px' }}>EXPERIENCE LOOKBOOK</h2>
          <div className="mag-gallery">
            {spot.gallery.map((img, i) => (
              <div key={i} className="gal-img-wrapper shadow-xl">
                 <Image 
                    src={img} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    alt={`Spot Gallery ${i}`} 
                 />
              </div>
            ))}
          </div>
        </section>

        {/* E. Call to Action: Premium Dark Style */}
        <section className="mag-cta">
          <div className="cta-box">
            <h2 className="mag-name" style={{ color: '#fff', fontSize: ' clamp(32px, 5vw, 64px)', marginBottom: '30px' }}>
               VIVE LA EXPERIENCIA WAVE
            </h2>
            <p className="editorial-p" style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '40px' }}>
               Únete a la comunidad de surf más exclusiva de Chile.
            </p>
            <Link href="/agenda" className="mag-cta-btn">
              {spot.ctaText || "SOLICITAR MEMBRESÍA"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="mag-footer">
        <p>WAVE SURF CLUB © 2015-2026</p>
      </footer>

      <style jsx>{`
        .spot-magazine {
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family: var(--font-archivo), sans-serif;
        }

        /* --- HERO --- */
        .mag-hero {
          height: 85vh;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px 8%;
          overflow: hidden;
          background: #000;
          margin-top: var(--nav-height, 95px);
        }
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent 50%);
          z-index: 2;
        }
        .hero-title-box {
          position: relative;
          z-index: 3;
          background: rgba(255, 255, 255, 0.98);
          padding: 30px 60px;
          border-left: 10px solid #38bdf8;
          box-shadow: 30px 30px 0px rgba(56, 189, 248, 0.2);
        }
        .mag-tag {
          color: #38bdf8;
          font-weight: 800;
          letter-spacing: 5px;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .mag-name {
          font-size: clamp(24px, 5vw, 72px);
          font-weight: 950;
          line-height: 0.9;
          display: flex;
          align-items: center;
          gap: 20px;
          text-transform: uppercase;
          margin: 0;
          color: #000;
          letter-spacing: -0.04em;
        }
        .mag-prefix {
          color: #38bdf8;
          opacity: 0.8;
        }

        /* --- CONTENT --- */
        .mag-content {
          padding: 120px 8%;
          background: #000;
        }
        .editorial-row {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 100px;
          margin-bottom: 150px;
          align-items: start;
        }
        .editorial-title {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 950;
          letter-spacing: -2px;
          margin-bottom: 40px;
          color: #fff;
          text-transform: uppercase;
          line-height: 1;
        }
        .editorial-p {
          font-size: 18px;
          line-height: 1.8;
          color: #94a3b8;
          font-weight: 300;
          max-width: 800px;
        }
        .editorial-p p { margin-bottom: 30px; }

        /* --- STATS --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 60px;
          margin-top: 60px;
        }
        .stat-item h6 {
          font-size: 11px;
          color: #38bdf8;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 12px;
          font-weight: 800;
        }
        .stat-item p {
          font-size: 24px;
          font-weight: 900;
          margin: 0;
          color: #fff;
          letter-spacing: -1px;
        }

        /* --- AMENITIES --- */
        .amenities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
        }
        .amenity-card {
          background: #0a0a0a;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          transition: border-color 0.3s;
        }
        .amenity-card:hover {
          border-color: #38bdf8;
        }
        .amenity-card strong {
          display: block;
          font-size: 18px;
          color: #fff;
          margin-bottom: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .amenity-card p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        /* --- MAP --- */
        .tech-map-premium {
          width: 100%;
          height: 400px;
          background: #0a0a0a;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
        }
        .sticky-col {
          position: sticky;
          top: 150px;
        }

        /* --- SOCIAL VIDS --- */
        .mag-social-vids {
          margin-bottom: 150px;
        }
        .sessions-label {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #38bdf8;
          text-transform: uppercase;
          display: block;
          text-align: center;
          margin-bottom: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 20px;
        }
        .social-vids-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 60px;
          justify-items: center;
        }
        .instagram-premium-box {
          width: 100%;
          max-width: 500px;
          background: #fff;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          transition: transform 0.4s;
        }
        .instagram-premium-box:hover {
          transform: translateY(-15px);
        }

        /* --- GALLERY --- */
        .mag-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .gal-img-wrapper {
          position: relative;
          height: 700px;
          background: #0a0a0a;
        }
        .gal-img-wrapper:nth-child(3n) {
          grid-column: span 2;
          height: 900px;
        }

        /* --- CTA --- */
        .mag-cta {
          padding: 150px 0;
          text-align: center;
          background: linear-gradient(to top, #0f172a, #000);
        }
        .cta-box {
          max-width: 800px;
          margin: 0 auto;
        }
        .mag-cta-btn {
          display: inline-block;
          background: #fff;
          color: #000;
          padding: 24px 60px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 12px 12px 0px #38bdf8;
        }
        .mag-cta-btn:hover {
          transform: translate(-4px, -4px);
          box-shadow: 16px 16px 0px #38bdf8;
          background: #38bdf8;
          color: #fff;
        }

        .mag-footer {
          padding: 100px 40px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: #475569;
          font-size: 11px;
          letter-spacing: 5px;
          text-transform: uppercase;
        }

        @media (max-width: 1200px) {
          .editorial-row { grid-template-columns: 1fr; gap: 60px; }
          .img-col { order: -1; }
          .tech-map-premium { height: 300px; }
          .sticky-col { position: static; }
        }

        @media (max-width: 768px) {
          .hero-title-box { padding: 20px 30px; box-shadow: 15px 15px 0px rgba(56, 189, 248, 0.2); }
          .mag-content { padding: 60px 5%; }
          .stats-grid { grid-template-columns: 1fr; gap: 30px; }
          .amenities-grid { grid-template-columns: 1fr; }
          .social-vids-grid { grid-template-columns: 1fr; }
          .gal-img-wrapper { height: 400px; }
          .gal-img-wrapper:nth-child(3n) { height: 400px; grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
