'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function EventosPage() {
  const { t } = useTranslation();

  return (
    <main className="dark-landing">
      <Navbar />

      {/* Hero Eventos */}
      <section className="px-section" style={{ minHeight: '60vh', marginTop: 'var(--nav-height)' }}>
        <div className="px-bg-wrapper">
          <Image 
            src="/fondo-logo.png" 
            alt="Eventos Wave Surf Club" 
            fill 
            priority
            style={{ objectFit: 'cover', opacity: 0.5 }}
          />
        </div>
        <div className="px-overlay" />
        <div className="px-content">
          <h1 style={{ 
            fontSize: 'clamp(40px, 8vw, 100px)', 
            fontWeight: 900, 
            letterSpacing: '8px',
            textTransform: 'uppercase'
          }}>E V E N T O S</h1>
          <div style={{ fontSize: '14px', letterSpacing: '8px', color: '#38bdf8', marginTop: '20px' }}>WAVE EXPERIENCE</div>
        </div>
      </section>

      {/* Contenido Eventos */}
      <section style={{ padding: '100px 20px', background: '#0b1120', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-archivo), sans-serif', 
            fontSize: '40px', 
            fontWeight: 900,
            color: '#fff', 
            marginBottom: '30px',
            letterSpacing: '-1px'
          }}>PRÓXIMAMENTE</h2>
          
          <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.8', marginBottom: '40px' }}>
            Estamos preparando el calendario de competencias, surf trips y encuentros locales para la temporada 2025-2026. 
            Wave Surf Club es más que una escuela; es el epicentro de los eventos de tabla más importantes de la costa chilena.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px',
            marginTop: '60px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#38bdf8', fontSize: '12px', letterSpacing: '2px' }}>CALENDARIO</h3>
                <p style={{ color: '#fff', marginTop: '10px' }}>Competencias Internacionales</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#38bdf8', fontSize: '12px', letterSpacing: '2px' }}>SURF TRIPS</h3>
                <p style={{ color: '#fff', marginTop: '10px' }}>Expediciones a Pichilemu</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0b1120', padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#475569', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            © 2015 - 2026 WAVE SURF CLUB — CHILE
          </p>
      </footer>
    </main>
  );
}
