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
      title: 'SEDE CONCÓN',
      subtitle: 'Sede Matriz',
      slogan: 'El corazón de Wave Surf Club.',
      desc: 'Nuestra base histórica y el punto de encuentro principal.',
      img: '/fondo-escuela.png',
      features: ['Mirador Privado', 'Zona de Confort', 'Skate Park Interno']
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
          src="/tomi-bock-fondo.png" 
          alt="Bio Wave Surf Club" 
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
                <div style={{ height: '160px', position: 'relative', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image src={sede.img} alt={sede.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '5px' }}>{sede.title}</h3>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 900, marginBottom: '15px', letterSpacing: '1px' }}>{sede.subtitle}</div>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', marginBottom: '20px' }}>{sede.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {sede.features.map(f => (
                        <span key={f} style={{ fontSize: '10px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{f}</span>
                    ))}
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
