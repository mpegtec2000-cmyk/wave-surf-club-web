'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

// ── Datos editables de eventos realizados ──────────────────────────────────
const EVENTOS_REALIZADOS = [
  // Agrega aquí tus eventos con { titulo, imagen }
  // { titulo: 'CAMPEONATO OPEN CONCÓN 2025', imagen: '/eventos/campeonato-concon.jpg' },
];

// ── Datos de secciones de servicios ───────────────────────────────────────
const SECCIONES = [
  {
    numero: '01',
    titulo: 'EXPERIENCIAS Y EVENTOS',
    color: '#38bdf8',
    items: [
      { nombre: 'PASEOS DE CURSO', desc: 'Jornadas deportivas y recreativas completas para colegios e instituciones.' },
      { nombre: 'CAMPEONATOS SURF & SKATE', desc: 'Producción integral de torneos y eventos deportivos profesionales.' },
      { nombre: 'SUNSET & CAFETERÍA', desc: 'Relájate en nuestro mirador con el mejor café, snacks y ambiente de la zona.' },
      { nombre: 'TIENDA & AMENITIES', desc: 'Venta de equipo técnico, acceso a camarines, duchas y áreas de descanso.' },
    ]
  },
  {
    numero: '02',
    titulo: 'ACADEMIA DE MAR Y TIERRA',
    color: '#34d399',
    items: [
      { nombre: 'CLASES DE SURF', desc: 'Sesiones individuales, en pareja o grupales para todos los niveles de aprendizaje.' },
      { nombre: 'ENTRENAMIENTO MEGA RAMP', desc: 'Clases de skate en rampa gigante para todas las edades.' },
      { nombre: 'PLANES MENSUALES', desc: 'Membresías de entrenamiento semanal con beneficios y descuentos exclusivos.' },
    ]
  },
  {
    numero: '03',
    titulo: 'RENTAL Y SOPORTE',
    color: '#f59e0b',
    items: [
      { nombre: 'CENTRO DE ARRIENDO', desc: 'Tablas y trajes de alta gama disponibles para entrega inmediata.' },
      { nombre: 'BODEGA', desc: 'Servicio mensual de guardado para tu equipo personal.' },
      { nombre: 'TALLER TÉCNICO', desc: 'Reparación profesional de tablas (Exclusivo en sucursal Pichilemu).' },
    ]
  },
  {
    numero: '04',
    titulo: 'AVENTURA Y ENTORNO',
    color: '#f43f5e',
    items: [
      { nombre: 'VUELOS EN PARAPENTE', desc: 'Sobrevuela la costa en Punta de Piedra (Vuelos de 20 min / 09:00 a 13:00 hrs).' },
      { nombre: 'PARQUE DE AVENTURA', desc: 'Canchas de Volleyball playa, Columpios del Amor, Bowl Godzilla y cercanía a Go-Karts y Acuario.' },
    ]
  },
];

const ESTACIONES = [
  {
    ciudad: 'CONCÓN',
    emoji: '🏖️',
    desc: 'El centro del entrenamiento, cafetería y nuestra MEGA RAMP principal.',
  },
  {
    ciudad: 'PUNTA DE PIEDRA',
    emoji: '🪂',
    desc: 'El hub de la adrenalina con parapente, columpios del amor y canchas deportivas.',
  },
  {
    ciudad: 'PICHILEMU',
    emoji: '🏄',
    desc: 'Punto estratégico enfocado en reparaciones técnicas, bodega de equipo y tienda.',
  },
];

export default function EventosPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 'var(--nav-height)' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/fondo-logo.png" alt="Wave Adventure" fill priority style={{ objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '6px', color: '#38bdf8', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>
            AGENCIA DE TURISMO DEPORTIVO
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 950, letterSpacing: '-2px', lineHeight: 0.9, margin: '0 0 24px', textTransform: 'uppercase' }}>
            WAVE<br />
            <span style={{ color: '#38bdf8' }}>ADVENTURE</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.6)', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            EXPLORA LA COSTA CON LOS EXPERTOS
          </p>
        </div>
      </section>

      {/* ── SECCIONES DE SERVICIOS ── */}
      <section style={{ padding: '100px 20px', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))', gap: '60px' }}>
          {SECCIONES.map((sec) => (
            <div key={sec.numero}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: sec.color, letterSpacing: '3px', fontFamily: 'monospace' }}>{sec.numero}</span>
                <div style={{ flex: 1, height: '1px', background: `${sec.color}40` }} />
                <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '3px', color: sec.color, textTransform: 'uppercase', margin: 0 }}>
                  {sec.titulo}
                </h2>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sec.items.map((item) => (
                  <div key={item.nombre} style={{ borderLeft: `3px solid ${sec.color}30`, paddingLeft: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '2px', color: '#fff', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {item.nombre}
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NUESTRAS ESTACIONES ── */}
      <section style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '6px', color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '60px' }}>
            NUESTRAS ESTACIONES
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {ESTACIONES.map((est) => (
              <div key={est.ciudad} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '16px', 
                padding: '40px 32px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{est.emoji}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: '#fff', marginBottom: '12px' }}>
                  {est.ciudad}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', margin: 0 }}>
                  {est.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVENTURAS REALIZADAS ── */}
      <section style={{ padding: '100px 20px', maxWidth: '1300px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '6px', color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px' }}>
          AVENTURAS REALIZADAS
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '60px' }}>
          GALERÍA DE EVENTOS Y CAMPEONATOS
        </p>

        {EVENTOS_REALIZADOS.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {EVENTOS_REALIZADOS.map((ev, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <Image src={ev.imagen} alt={ev.titulo} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                    {ev.titulo}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌊</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              PRÓXIMAMENTE — GALERÍA DE EVENTOS
            </p>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          © 2015 – 2026 WAVE SURF CLUB — AGENCIA DE TURISMO DEPORTIVO — CHILE
        </p>
      </footer>
    </main>
  );
}
