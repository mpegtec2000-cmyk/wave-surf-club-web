'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';
import { addClient, queueNotification } from '@/lib/data';

export default function EventosPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error'
  const [formData, setFormData] = useState({
    name: '', rut: '', phone: '', email: '', eventType: 'PASEO DE EMPRESA', 
    description: '', adults: 1, children: 0, date: '', branch: 'Concón'
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // 1. Registrar cliente (si es nuevo) o actualizar datos
      await addClient({
        name: formData.name,
        rut: formData.rut,
        phone: formData.phone,
        email: 'mpeg.logistica@gmail.com', // Placeholder for internal use or we can ask for email
        metadata: { origin: 'cotizacion_evento', type: formData.eventType }
      });

      // 2. Enviar notificación al correo
      const content = {
        mensaje: `Nueva solicitud de cotización de evento desde la web.`,
        datos: {
          nombre: formData.name,
          rut: formData.rut,
          telefono: formData.phone,
          email: formData.email,
          tipo_evento: formData.eventType,
          sede: formData.branch,
          fecha_deseada: formData.date,
          adultos: formData.adults,
          niños: formData.children,
          mensaje_cliente: formData.description
        }
      };

      const { error } = await queueNotification(
        'event_quote_request', 
        'mpeg.logistica@gmail.com', 
        `Cotización: ${formData.eventType} (${formData.branch} - ${formData.date}) - ${formData.name}`, 
        content
      );

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', rut: '', phone: '', email: '', eventType: 'PASEO DE EMPRESA', description: '', adults: 1, children: 0, date: '', branch: 'Concón' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

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
    <main className="dark-landing" style={{ background: '#000' }}>
      {/* Fixed Background Image */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0
      }}>
        <Image 
          src="/eventos.jpg" 
          alt="Eventos Background" 
          fill 
          priority
          style={{ objectFit: 'cover', filter: 'brightness(0.3)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))' }} />
      </div>

      <Navbar />

      {/* Hero section */}
      <section className="px-section" style={{ minHeight: '60vh', marginTop: 'var(--nav-height)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="px-content" style={{ zIndex: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', padding: '60px 80px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ 
            fontSize: 'clamp(40px, 10vw, 120px)', 
            fontWeight: 950, 
            letterSpacing: '-5px',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 0.9
          }}>EVENTOS</h1>
          <p style={{ 
            fontSize: '14px', 
            letterSpacing: '10px', 
            color: '#38bdf8', 
            marginTop: '20px',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>EVENTOS</p>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '100px 20px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
      <section style={{ padding: '100px 20px', background: 'rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>
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

      {/* Quotation Form Section */}
      <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', padding: '60px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '10px' }}>COTIZA TU EVENTO</h2>
            <p style={{ color: '#94a3b8' }}>Cuéntanos qué tienes en mente y te responderemos a la brevedad.</p>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <h3 style={{ color: '#4ade80', fontSize: '24px', fontWeight: 900 }}>¡Petición Enviada!</h3>
              <p style={{ color: '#94a3b8', marginTop: '10px' }}>Revisaremos tu solicitud y te contactaremos pronto. 🤙</p>
              <button onClick={() => setStatus(null)} style={{ marginTop: '20px', background: 'none', border: '1px solid #fff', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Enviar otra</button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nombre Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>
              
              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email para Contacto</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>
              
              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>RUT</label>
                <input required type="text" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} placeholder="12.345.678-9" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>
              
              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Teléfono</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+56 9..." style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>

              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tipo de Evento</label>
                <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} style={{ width: '100%', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>
                  <option value="PASEO DE EMPRESA">PASEO DE EMPRESA</option>
                  <option value="PASEO DE CURSO">PASEO DE CURSO</option>
                  <option value="PERSONAS">PERSONAS</option>
                </select>
              </div>

              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Sede de Interés</label>
                <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} style={{ width: '100%', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>
                  <option value="Concón">CONCÓN</option>
                  <option value="Punta de Piedra">PUNTA DE PIEDRA</option>
                  <option value="Pichilemu">PICHILEMU</option>
                </select>
              </div>

              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Fecha Deseada</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', colorScheme: 'dark' }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>Selecciona el día aproximado del servicio.</span>
              </div>

              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Adultos (+18)</label>
                <input type="number" min="0" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>

              <div className="field-group">
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Niños (-18)</label>
                <input type="number" min="0" value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </div>

              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Descripción (Máx 500 caracteres)</label>
                <textarea 
                  required 
                  maxLength={500} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Cuéntanos más sobre el evento..." 
                  style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', minHeight: '120px', resize: 'vertical' }}
                />
                <div style={{ fontSize: '10px', textAlign: 'right', color: '#475569', marginTop: '5px' }}>{formData.description.length}/500</div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900, letterSpacing: '2px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 20px -5px rgba(56, 189, 248, 0.4)', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'PROCESANDO SOLICITUD...' : 'SOLICITAR COTIZACIÓN (PDF)'}
              </button>
              
              {status === 'error' && <p style={{ gridColumn: 'span 2', color: '#f87171', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>Error al enviar. Por favor intenta de nuevo.</p>}
            </form>
          )}
        </div>
      </section>

      {/* Performed Adventures Gallery */}
      <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
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
      <footer style={{ padding: '80px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div style={{ opacity: 0.3 }}>
          <p style={{ fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 700 }}>
            WAVE SURF CLUB — EVENTOS Y PRODUCCIÓN — CHILE
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

