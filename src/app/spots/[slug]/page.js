'use client';

import './spot.css';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SPOTS_DATA } from '@/lib/spots-data';
import Navbar from '@/components/Navbar';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

export default function SpotPage() {
  const params = useParams();
  const slug = params?.slug;
  const spot = SPOTS_DATA[slug];

  if (!spot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#000000' }}>
        <Navbar />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>SPOT NO ENCONTRADO</h2>
        <Link href="/escuelas" style={{ padding: '12px 24px', background: '#000000', color: '#ffffff', borderRadius: 9999, fontSize: 12, fontWeight: 800 }}>
          VOLVER A ESCUELAS
        </Link>
      </div>
    );
  }

  return (
    <div className="spot-magazine">
      <Navbar />

      <header className="mag-hero">
        <Image
          src={spot.heroImage}
          alt={spot.name}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="hero-gradient-overlay" />
        <div className="hero-title-box">
          <Link href="/escuelas" className="mag-back-link">
            <ArrowLeft size={14} /> ESCUELAS
          </Link>
          <span className="mag-tag">DESTINATION · CHILE</span>
          <h1 className="mag-name">{spot.name.toUpperCase()}</h1>
        </div>
      </header>

      <main className="mag-content">
        <div className="editorial-row">
          <div className="text-col">
            <span className="section-mono">01 / DETALLE DE SEDE</span>
            <h2 className="editorial-title">
              {slug === 'concon' ? 'ESCUELA CONCÓN' : spot.name.toUpperCase()}
            </h2>
            <div className="editorial-p">
              {spot.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

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
            </div>

            <div className="amenities-container">
              <h3 className="editorial-subtitle">INSTALACIONES &amp; AMENITIES</h3>
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
              />
            </div>
          </div>
        </div>

        <section className="mag-cta">
          <div className="cta-box">
            <span className="section-mono">RESERVAS ONLINE</span>
            <h2 className="cta-title">VIVE LA EXPERIENCIA WAVE®</h2>
            <p className="cta-desc">Únete a la comunidad de surf y skate más activa de la costa chilena.</p>
            <Link href="/agenda" className="mag-cta-btn">
              <span>{spot.ctaText || 'AGENDAR TU CLASE'}</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mag-footer">
        <p>WAVE SURF CLUB® © 2015-2026</p>
      </footer>
    </div>
  );
}
