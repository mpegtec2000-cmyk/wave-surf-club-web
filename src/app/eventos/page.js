'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function EventosPage() {
  const { t } = useTranslation();

  const categories = [
    {
      title: '1. EXPERIENCIAS Y EVENTOS',
      items: [
        { label: 'PASEOS DE CURSO', desc: 'Jornadas deportivas y recreativas completas para colegios e instituciones.' },
        { label: 'CAMPEONATOS SURF & SKATE', desc: 'Producción integral de torneos y eventos deportivos profesionales.' },
        { label: 'SUNSET & CAFETERÍA', desc: 'Relájate en nuestro mirador con el mejor café, snacks y ambiente de la zona.' },
        { label: 'TIENDA & AMENITIES', desc: 'Venta de equipo técnico, acceso a camarines, duchas y áreas de descanso.' }
      ]
    },
    {
      title: '2. ACADEMIA DE MAR Y TIERRA',
      items: [
        { label: 'CLASES DE SURF', desc: 'Sesiones individuales, en pareja o grupales para todos los niveles de aprendizaje.' },
        { label: 'ENTRENAMIENTO MEGA RAMP', desc: 'Clases de skate en rampa gigante para todas las edades.' },
        { label: 'PLANES MENSUALES', desc: 'Membresías de entrenamiento semanal con beneficios y descuentos exclusivos.' }
      ]
    },
    {
      title: '3. RENTAL Y SOPORTE',
      items: [
        { label: 'CENTRO DE ARRIENDO', desc: 'Tablas y trajes de alta gama disponibles para entrega inmediata.' },
        { label: 'BODEGA', desc: 'Servicio mensual de guardado para tu equipo personal.' },
        { label: 'TALLER TÉCNICO', desc: 'Reparación profesional de tablas (Exclusivo en sucursal Pichilemu).' }
      ]
    },
    {
      title: '4. AVENTURA Y ENTORNO',
      items: [
        { label: 'VUELOS EN PARAPENTE', desc: 'Sobrevuela la costa en Punta de Piedra (Vuelos de 20 min / 09:00 a 13:00 hrs).' },
        { label: 'PARQUE DE AVENTURA', desc: 'Canchas de Volleyball playa, Columpios del Amor, Bowl Godzilla y cercanía a Go-Karts y Acuario.' }
      ]
    }
  ];

  const stations = [
    { name: 'CONCÓN', desc: 'El centro del entrenamiento, cafetería y nuestra MEGA RAMP principal.' },
    { name: 'PUNTA DE PIEDRA', desc: 'El hub de la adrenalina con parapente, columpios del amor y canchas deportivas.' },
    { name: 'PICHILEMU', desc: 'Punto estratégico enfocado en reparaciones técnicas, bodega de equipo y tienda.' }
  ];

  const pastEvents = [
    { title: 'CAMPEONATO RIPI CURL CONCON', img: '/riders/paulo/R1.jpg' },
    { title: 'EVENTO EMPRESARIAL 2024', img: '/riders/paulo/R2.jpg' },
    { title: 'PASEO COLEGIO SAINT MARGARETS', img: '/riders/paulo/R3.jpg' },
    { title: 'INAUGURACIÓN MEGA RAMP', img: '/riders/paulo/R4.jpg' }
  ];

  return (
    <main className="dark-landing" style={{ background: '#000', color: '#fff' }}>
      <Navbar />

      {/* Hero section */}
      <section className="px-section" style={{ minHeight: '60vh', marginTop: 'var(--nav-height)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="px-bg-wrapper">
          <Image 
            src="/PORTADA.jpg" 
            alt="Wave Adventure" 
            fill 
            priority
            style={{ objectFit: 'cover', opacity: 0.4 }}
          />
        </div>
        <div className="px-content" style={{ zIndex: 10 }}>
          <h1 style={{ 
            fontSize: 'clamp(40px, 10vw, 120px)', 
            fontWeight: 950, 
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 0.9
          }}>WAVE ADVENTURE</h1>
          <p style={{ 
            fontSize: '14px', 
            letterSpacing: '10px', 
            color: '#38bdf8', 
            marginTop: '20px',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>EXPLORA LA COSTA CON LOS EXPERTOS</p>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '100px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          {categories.map((cat, idx) => (
            <div key={idx}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 900, 
                color: '#38bdf8', 
                letterSpacing: '3px', 
                marginBottom: '30px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
                paddingBottom: '15px'
              }}>{cat.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {cat.items.map((item, i) => (
                  <div key={i}>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</h4>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stations Section */}
      <section style={{ padding: '100px 20px', background: '#0b1120' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '12px', letterSpacing: '8px', color: '#38bdf8', marginBottom: '30px', fontWeight: 900 }}>NUESTRAS ESTACIONES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '60px' }}>
            {stations.map((station, idx) => (
              <div key={idx} style={{ 
                padding: '40px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '20px', letterSpacing: '-1px' }}>{station.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7' }}>{station.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performed Adventures Gallery */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '12px', letterSpacing: '8px', color: '#38bdf8', marginBottom: '60px', fontWeight: 900, textAlign: 'center' }}>AVENTURAS REALIZADAS</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '24px' 
          }}>
            {pastEvents.map((event, idx) => (
              <div key={idx} style={{ position: 'relative', overflow: 'hidden', borderRadius: '15px', aspectRatio: '16/10', group: 'true' }}>
                <Image 
                  src={event.img} 
                  alt={event.title} 
                  fill 
                  style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  className="hover-zoom"
                />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  padding: '30px' 
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{event.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer style={{ padding: '80px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
        <div style={{ opacity: 0.3 }}>
          <p style={{ fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 700 }}>
            WAVE ADVENTURE — AGENCIA DE TURISMO DEPORTAIVO — CHILE
          </p>
        </div>
      </footer>

      <style jsx>{`
        .hover-zoom:hover {
          transform: scale(1.05);
        }
      `}</style>
    </main>
  );
}

