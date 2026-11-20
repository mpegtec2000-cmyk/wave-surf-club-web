'use client';

import './eventos.css';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { addClient, queueNotification } from '@/lib/data';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function EventosPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    phone: '',
    email: '',
    eventType: 'PASEO DE EMPRESA',
    description: '',
    adults: 1,
    children: 0,
    date: '',
    branch: 'Concón'
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await addClient({
        name: formData.name,
        rut: formData.rut,
        phone: formData.phone,
        email: formData.email || 'contacto@wavesurfclub.cl',
        metadata: { origin: 'cotizacion_evento', type: formData.eventType }
      }).catch(() => {});

      await queueNotification(
        'event_quote_request',
        'mpeg.logistica@gmail.com',
        `Cotización: ${formData.eventType} (${formData.branch} - ${formData.date}) - ${formData.name}`,
        {
          mensaje: 'Nueva solicitud de cotización de evento desde la web.',
          datos: { ...formData }
        }
      ).catch(() => {});

      setStatus('success');
      setFormData({
        name: '', rut: '', phone: '', email: '',
        eventType: 'PASEO DE EMPRESA', description: '',
        adults: 1, children: 0, date: '', branch: 'Concón'
      });
    } catch {
      setStatus('success');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      num: '01',
      title: 'EXPERIENCIAS Y EVENTOS',
      items: [
        { label: 'PASEOS DE CURSO', desc: 'Jornadas deportivas y recreativas completas para colegios e instituciones.' },
        { label: 'CAMPEONATOS SURF & SKATE', desc: 'Producción integral de torneos y eventos deportivos profesionales.' },
        { label: 'SUNSET & CAFETERÍA', desc: 'Relájate en nuestro mirador con café de especialidad, snacks y vista directa al mar.' },
        { label: 'TIENDA & AMENITIES', desc: 'Venta de equipo técnico, acceso a camarines, duchas y zonas de descanso.' }
      ]
    },
    {
      num: '02',
      title: 'ACADEMIA DE MAR Y TIERRA',
      items: [
        { label: 'CLASES DE SURF', desc: 'Sesiones individuales, en pareja o grupales para todos los niveles.' },
        { label: 'ENTRENAMIENTO MEGA RAMP', desc: 'Clases de skate en rampa gigante para todas las edades.' },
        { label: 'PLANES MENSUALES', desc: 'Membresías de entrenamiento semanal con beneficios exclusivos.' }
      ]
    },
    {
      num: '03',
      title: 'RENTAL Y SOPORTE',
      items: [
        { label: 'CENTRO DE ARRIENDO', desc: 'Tablas y trajes de alta gama disponibles para entrega inmediata.' },
        { label: 'BODEGA', desc: 'Servicio mensual de guardado seguro para tu equipo personal.' },
        { label: 'TALLER TÉCNICO', desc: 'Reparación profesional y shaping de tablas (Sede Pichilemu).' }
      ]
    },
    {
      num: '04',
      title: 'AVENTURA Y ENTORNO',
      items: [
        { label: 'VUELOS EN PARAPENTE', desc: 'Sobrevuela la costa en Punta de Piedra (Vuelos 20 min / 09:00 a 13:00 hrs).' },
        { label: 'PARQUE DE AVENTURA', desc: 'Volleyball playa, Bowl Godzilla, miradores y panoramas costeros.' }
      ]
    }
  ];

  const stations = [
    { num: '01', name: 'CONCÓN', desc: 'El centro del entrenamiento, cafetería y nuestra MEGA RAMP principal.' },
    { num: '02', name: 'PUNTA DE PIEDRA', desc: 'El hub de adrenalina con parapente, vistas 360° y canchas deportivas.' },
    { num: '03', name: 'PICHILEMU', desc: 'Punto estratégico de olas world-class, taller Agave, bodega y tienda.' }
  ];

  const pastEvents = [
    { title: 'CAMPEONATO SURF CONCÓN', img: '/TIENDA/1.PNG' },
    { title: 'EVENTO EMPRESARIAL WAVE', img: '/TIENDA/7.PNG' },
    { title: 'PASEO COLEGIO SAINT MARGARETS', img: '/TIENDA/3.PNG' },
    { title: 'INAUGURACIÓN MEGA RAMP', img: '/TIENDA/IMG_5779.jpeg' }
  ];

  return (
    <main className="ev-root">
      <Navbar />

      {/* HERO BANNER */}
      <section className="ev-hero">
        <Image
          src="/eventos.jpg"
          alt="Eventos Wave Surf Club"
          fill
          priority
          style={{ objectFit: 'cover', filter: 'grayscale(35%) brightness(0.45)' }}
        />
        <div className="ev-hero-inner">
          <span className="ev-kicker">PRODUCCIÓN · EMPRESAS · COLEGIOS · CAMPEONATOS</span>
          <h1>EVENTOS®</h1>
          <p>Diseñamos jornadas deportivas, paseos de empresa y campeonatos de surf &amp; skate frente al Pacífico.</p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="ev-section">
        <div className="ev-container">
          <div className="ev-cat-grid">
            {categories.map((cat) => (
              <div key={cat.num} className="ev-cat-card">
                <div className="ev-cat-head">
                  <span className="ev-cat-num">{cat.num}</span>
                  <h3>{cat.title}</h3>
                </div>
                <div className="ev-cat-items">
                  {cat.items.map((item, i) => (
                    <div key={i} className="ev-cat-item">
                      <h4>{item.label}</h4>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATIONS */}
      <section className="ev-section ev-alt">
        <div className="ev-container">
          <div className="ev-sec-header">
            <span className="ev-mono">SEDES DISPONIBLES</span>
            <h2>NUESTRAS ESTACIONES</h2>
          </div>
          <div className="ev-stations-grid">
            {stations.map((st) => (
              <div key={st.num} className="ev-station-card">
                <span className="ev-st-num">{st.num}</span>
                <h3>{st.name}</h3>
                <p>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTATION FORM */}
      <section className="ev-section">
        <div className="ev-container">
          <div className="ev-form-card">
            <div className="ev-sec-header">
              <span className="ev-mono">SOLICITUD DIRECTA</span>
              <h2>COTIZA TU EVENTO</h2>
              <p className="ev-form-sub">Cuéntanos qué tienes en mente y nuestro equipo te enviará una propuesta a medida.</p>
            </div>

            {status === 'success' ? (
              <div className="ev-success">
                <CheckCircle2 size={44} />
                <h3>¡SOLICITUD RECIBIDA!</h3>
                <p>Revisaremos los detalles de tu evento y te contactaremos a la brevedad.</p>
                <button type="button" onClick={() => setStatus(null)} className="ev-btn-black">
                  ENVIAR OTRA COTIZACIÓN
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="ev-form-grid">
                <div className="ev-field ev-span-2">
                  <label>NOMBRE COMPLETO</label>
                  <input required type="text" placeholder="Ej. Catalina Morales" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="ev-field">
                  <label>EMAIL DE CONTACTO</label>
                  <input required type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div className="ev-field">
                  <label>RUT</label>
                  <input required type="text" placeholder="12.345.678-9" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} />
                </div>

                <div className="ev-field">
                  <label>TELÉFONO</label>
                  <input required type="text" placeholder="+56 9..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="ev-field">
                  <label>TIPO DE EVENTO</label>
                  <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                    <option value="PASEO DE EMPRESA">PASEO DE EMPRESA</option>
                    <option value="PASEO DE CURSO">PASEO DE CURSO</option>
                    <option value="CAMPEONATO / MARCA">CAMPEONATO / MARCA</option>
                    <option value="PERSONAS">GRUPOS &amp; CUMPLEAÑOS</option>
                  </select>
                </div>

                <div className="ev-field">
                  <label>SEDE DE INTERÉS</label>
                  <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                    <option value="Concón">CONCÓN</option>
                    <option value="Punta de Piedra">PUNTA DE PIEDRA</option>
                    <option value="Pichilemu">PICHILEMU</option>
                  </select>
                </div>

                <div className="ev-field">
                  <label>FECHA DESEADA</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>

                <div className="ev-field">
                  <label>ADULTOS (+18)</label>
                  <input type="number" min="0" value={formData.adults} onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value, 10) || 0 })} />
                </div>

                <div className="ev-field">
                  <label>NIÑOS (-18)</label>
                  <input type="number" min="0" value={formData.children} onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value, 10) || 0 })} />
                </div>

                <div className="ev-field ev-span-2">
                  <label>DESCRIPCIÓN ({formData.description.length}/500)</label>
                  <textarea
                    required
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Cuéntanos más sobre horarios, actividades o requerimientos especiales..."
                  />
                </div>

                <button type="submit" disabled={loading} className="ev-submit-btn ev-span-2">
                  <span>{loading ? 'PROCESANDO SOLICITUD...' : 'SOLICITAR COTIZACIÓN'}</span>
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="ev-section ev-alt">
        <div className="ev-container">
          <div className="ev-sec-header">
            <span className="ev-mono">ARCHIVO</span>
            <h2>AVENTURAS REALIZADAS</h2>
          </div>

          <div className="ev-gallery-grid">
            {pastEvents.map((event, idx) => (
              <div key={idx} className="ev-gal-card">
                <Image src={event.img} alt={event.title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                <div className="ev-gal-overlay">
                  <h4>{event.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="ev-footer">
        WAVE SURF CLUB® — EVENTOS Y PRODUCCIÓN — CHILE
      </footer>
    </main>
  );
}
