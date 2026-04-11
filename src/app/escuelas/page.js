'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function EscuelasPage() {
  const { t } = useTranslation();

  const sedes = [
    {
      id: 'concon',
      title: 'WAVE SURF CLUB CONCÓN',
      subtitle: 'SEDE MATRIZ / PLAYA LA BOCA',
      slogan: 'El Epicentro del Surf & Skate en Chile',
      desc: 'Mega Ramp más grande de Chile y Staff de Élite. Única con EXPERIENCIA FULL DAY: tu equipo te espera para una segunda sesión sin costo adicional.',
      img: '/fondo-escuela.png',
      features: ['Mega Ramp Pro', 'Duchas Agua Caliente', 'Taller Neoprene', 'Cafetería & Mirador'],
      cta: 'ASEGURA TU LUGAR CON LOS MEJORES',
      highlight: 'RESERVA FULL DAY'
    },
    {
      id: 'pichilemu',
      title: 'PICHILEMU',
      subtitle: 'Capital del Surf',
      slogan: 'Donde viven las leyendas.',
      desc: 'Ubicada en la meca del surf chileno, inmersión total.',
      img: '/PICHILEMU.jpg',
      features: ['Infraestructura Pro', 'Entrenamiento Funcional', 'Acceso Directo']
    },
    {
      id: 'punta-piedra',
      title: 'SEDE PUNTA PIEDRA',
      subtitle: 'Inauguración 2026',
      slogan: 'El futuro del deporte.',
      desc: 'Nuestra sede más moderna y tecnológica de vanguardia.',
      img: '/tomi-bock-fondo.png',
      features: ['Arquitectura 360°', 'Rampas de Skate Pro', 'Inclusión Total']
    }
  ];

  return (
    <main style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      position: 'relative'
    }}>
      {/* Navbar principal */}
      <Navbar />

      {/* Imagen de Fondo (Full Screen) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1
      }}>
        <Image 
          src="/FONDO CONCON.jpg" 
          alt="Escuelas Wave Surf Club" 
          fill 
          priority
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.8
          }}
        />
        {/* Overlay para legibilidad */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }} />
      </div>

      {/* Grid de Sedes (Flotando sobre el fondo) */}
      <section style={{ 
        position: 'relative', 
        zIndex: 2, 
        padding: '140px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div className="schools-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {sedes.map(sede => (
            <Link key={sede.id} href={`/spots/${sede.id}`} style={{ textDecoration: 'none' }}>
              <div className="school-card" style={{
                background: 'rgba(255, 255, 255, 0.95)', // White cards as per original design
                borderRadius: '16px',
                padding: '30px',
                color: '#000',
                transition: 'transform 0.3s ease',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                height: '100%'
              }}>
                <div style={{ height: '180px', position: 'relative', marginBottom: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={sede.img} alt={sede.title} fill style={{ objectFit: 'cover' }} />
                    {sede.highlight && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '15px', 
                            right: '15px', 
                            background: '#38bdf8', 
                            color: '#fff', 
                            padding: '6px 12px', 
                            borderRadius: '50px', 
                            fontSize: '10px', 
                            fontWeight: '900',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 10px rgba(56, 189, 248, 0.4)'
                        }}>
                            {sede.highlight}
                        </div>
                    )}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 950, marginBottom: '5px', letterSpacing: '-0.02em' }}>{sede.title}</h3>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 900, marginBottom: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{sede.subtitle}</div>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '25px', fontWeight: '500' }}>{sede.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                    {sede.features.map(f => (
                        <span key={f} style={{ fontSize: '10px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{f}</span>
                    ))}
                </div>
                <div style={{ 
                    marginTop: 'auto',
                    width: '100%',
                    padding: '12px',
                    textAlign: 'center',
                    background: '#000',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '900',
                    borderRadius: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    {sede.cta || 'VER MÁS DETALLES'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style jsx global>{`
        body { margin: 0; padding: 0; background: #000; }
        .school-card:hover { transform: translateY(-10px); }

        @media (max-width: 768px) {
          section {
            padding: 100px 15px 40px !important;
          }
          .schools-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .school-card {
            padding: 20px !important;
          }
        }
      `}</style>

    </main>
  );
}
