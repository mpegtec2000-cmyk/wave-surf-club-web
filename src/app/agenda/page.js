'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { addClient, queueNotification } from '@/lib/data';
import Navbar from '@/components/Navbar';

// COMPONENTE: CALENDARIO PERSONALIZADO (Wave Style)
const CustomCalendar = ({ selectedDate, onSelect, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const renderDays = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    // Celdas vacías
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty" />);
    }

    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = new Date(dateStr + 'T23:59:59') < today;
      const isSelected = selectedDate === dateStr;
      const dateObj = new Date(dateStr + 'T12:00:00');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

      days.push(
        <div 
          key={d} 
          className={`cal-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
          onClick={() => !isPast && onSelect(dateStr)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="custom-calendar">
      <div className="cal-header">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>←</button>
        <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>→</button>
      </div>
      <div className="cal-grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {renderDays()}
      </div>
    </div>
  );
};

export default function AgendaPage() {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    sede: 'Concón'
  });

  // Booking details
  const [numAlumnos, setNumAlumnos] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [pricingLevels, setPricingLevels] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [receivingCard, setReceivingCard] = useState(null);
  const [dateRange, setDateRange] = useState({ min: '', max: '' });

  useEffect(() => {
    // 14 day window
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const future = new Date(today);
    future.setDate(future.getDate() + 15);

    setDateRange({
      min: tomorrow.toISOString().split('T')[0],
      max: future.toISOString().split('T')[0]
    });

    // Fetch prices and receiving card info
    const fetchData = async () => {
      const { data: prices } = await supabase.from('service_pricing').select('*').eq('is_active', true);
      if (prices) setPricingLevels(prices);

      const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'receiving_card_info').single();
      if (settings) setReceivingCard(JSON.parse(settings.value));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!bookingDate || !numAlumnos || pricingLevels.length === 0) return;
    const dateObj = new Date(bookingDate + 'T12:00:00');
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const category = isWeekend ? 'FINDE' : 'SEMANA';
    const match = pricingLevels.find(p => p.category === category && p.alumno_count === parseInt(numAlumnos));
    if (match) setCalculatedPrice(match);
  }, [bookingDate, numAlumnos, pricingLevels]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await addClient({ ...formData, metadata: { origin: 'website_agenda_portal' } });
      setStep('selection');
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al registrar tus datos. Reintenta.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate processing
      await new Promise(r => setTimeout(r, 2000));
      
      const { error } = await supabase.from('transactions').insert({
        description: `WEB: ${numAlumnos} Alumno(s) @ ${bookingDate} (${formData.sede})`,
        total: calculatedPrice.price_clp,
        type: 'ingreso',
        category: 'clase',
        method: 'transferencia',
        client_rut: formData.rut,
        branch_id: formData.sede === 'Concón' ? 1 : (formData.sede === 'Pichilemu' ? 2 : 3),
        payment_status: 'pagado',
        is_web_tx: true, // Mark as web transaction
        metadata: { ...formData, date: bookingDate, time: bookingTime, is_external: true }
      });
      if (error) throw error;

      await queueNotification('booking_confirmation', 'mpeg.logistica@gmail.com', `Notificacion de Agenda`, {
        mensaje: `El día ${bookingDate} a las ${bookingTime} se agendó una nueva sesión.`,
        cliente: {
          nombre: formData.name,
          rut: formData.rut,
          telefono: formData.phone,
          correo: formData.email,
          cantidad_personas: numAlumnos
        }
      });

      setStep('success');
    } catch (err) {
      setMsg({ type: 'error', text: 'Error procesando la reserva.' });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  return (
    <div className="agenda-portal">
      <style jsx>{`
        .agenda-portal {
          min-height: 100vh;
          background: #000;
          color: #f8fafc;
          font-family: var(--font-inter), sans-serif;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .portal-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 80px;
          position: relative;
          width: 100%;
        }
        .bg-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          opacity: 0.4;
        }

        .booking-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1000px;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          box-shadow: 0 50px 100px rgba(0,0,0,0.6);
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .booking-card { grid-template-columns: 1fr; }
          .card-visual { display: none; }
        }

        .card-visual {
          position: relative;
          background: #38bdf8;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          color: #0b1120;
        }
        .card-visual h2 {
          font-family: var(--font-archivo), sans-serif;
          font-size: 64px;
          font-weight: 900;
          line-height: 0.8;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: -3px;
        }
        .card-visual p {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: 18px;
        }

        .card-form { padding: 60px; }
        .form-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 40px;
          color: #38bdf8;
        }

        .sede-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px; }
        .sede-btn {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .sede-btn.active {
          background: #38bdf8;
          color: #0b1120;
          border-color: #38bdf8;
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
        .input {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 8px;
          color: #fff;
          outline: none;
        }
        .btn-submit {
          width: 100%; background: #38bdf8; color: #0b1120; font-weight: 900; padding: 18px; border-radius: 8px; text-transform: uppercase; cursor: pointer;
        }
        .msg { padding: 15px; border-radius: 8px; font-size: 13px; margin-bottom: 25px; text-align: center; }
        .msg.error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .alumnos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 30px; }
        .al-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center; cursor: pointer; font-weight: 800; }
        .al-pill.active { background: #38bdf8; color: #0b1120; border-color: #38bdf8; }
        
        .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; max-height: 180px; overflow-y: auto; }
        .time-pill { font-size: 11px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); text-align: center; cursor: pointer; }
        .time-pill.active { background: #38bdf8; color: #0b1120; }
        
        .price-summary { background: #38bdf8; color: #0b1120; padding: 25px; border-radius: 20px; margin-top: 30px; display: flex; align-items: center; justify-content: space-between; }
        .receipt-card { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.2); padding: 25px; border-radius: 16px; margin: 20px 0; }
        .checkout-info { margin: 20px 0; padding: 20px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.2); }

        .custom-calendar { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px; }
        .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .cal-header span { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #38bdf8; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
        .cal-day-label { font-size: 10px; font-weight: 800; color: #94a3b8; padding-bottom: 10px; }
        .cal-day { padding: 10px; font-size: 13px; border-radius: 8px; cursor: pointer; }
        .cal-day.selected { background: #38bdf8 !important; color: #000; font-weight: 900; }
        .cal-day.disabled { opacity: 0.2; cursor: not-allowed; }
        .cal-day.weekend { color: #38bdf8; }
      `}</style>

      <Navbar />

      <main className="portal-main">
        <div className="bg-overlay">
          <Image src="/PORTADA.jpg" alt="Wave School" fill priority style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        </div>

        <div className="booking-card">
          <div className="card-visual">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.6, zIndex: 0 }}>
              <Image src="/fondo-escuela.png" alt="Visual" fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '32px', lineHeight: '1.2' }}>Agenda tu clase con profesionales del deporte.</h2>
              <p>Agenda tu primera sesión y conviértete en parte de la familia Wave Surf Club.</p>
            </div>
          </div>

          <div className="card-form">
            <h2 className="form-title">Portal de Reservas</h2>

            {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

            {step === 'form' && (
              <form onSubmit={handleRegister}>
                <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Selecciona tu Sede</span>
                <div className="sede-selector">
                  {['Concón', 'Pichilemu', 'Punta Piedra'].map(s => (
                    <button key={s} type="button" className={`sede-btn ${formData.sede === s ? 'active' : ''}`} onClick={() => setFormData({...formData, sede: s})}>{s}</button>
                  ))}
                </div>

                <div className="form-grid">
                  <div className="field-group">
                    <label className="label">Nombre Completo</label>
                    <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="field-group">
                    <label className="label">RUT</label>
                    <input required className="input" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} placeholder="12.345.678-9" />
                  </div>
                  <div className="field-group">
                    <label className="label">Email</label>
                    <input required type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" />
                  </div>
                  <div className="field-group">
                    <label className="label">Teléfono</label>
                    <input required className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+56 9..." />
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Procesando...' : 'Siguiente Paso'}</button>
              </form>
            )}

            {step === 'selection' && (
              <div className="step-content">
                <div className="field-group">
                  <span className="label">¿Cuántos alumnos serán?</span>
                  <div className="alumnos-grid">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`al-pill ${numAlumnos === n ? 'active' : ''}`} onClick={() => setNumAlumnos(n)}>{n}</div>
                    ))}
                  </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 0.6fr' }}>
                  <div className="field-group">
                    <label className="label">Selecciona Fecha</label>
                    <CustomCalendar selectedDate={bookingDate} onSelect={setBookingDate} minDate={dateRange.min} />
                  </div>
                  <div className="field-group">
                    <label className="label">Horario</label>
                    <div className="time-grid" style={{ maxHeight: '320px' }}>
                      {timeSlots.map(t => (
                        <div key={t} className={`time-pill ${bookingTime === t ? 'active' : ''}`} onClick={() => setBookingTime(t)}>{t}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {calculatedPrice && (
                  <div className="price-summary">
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }}>Total Sesión</span>
                      <h3 style={{ fontSize: '24px', margin: 0 }}>${calculatedPrice.price_clp.toLocaleString()} CLP</h3>
                    </div>
                    <button onClick={() => setStep('checkout')} className="btn-submit" style={{ width: 'auto', padding: '12px 24px', background: '#000', color: '#fff' }}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {step === 'checkout' && (
              <div className="step-content">
                <span className="label">Resumen de Reserva</span>
                <div className="receipt-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                    <span>Sede {formData.sede}</span>
                    <span>{numAlumnos} Alumno(s)</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{bookingDate} @ {bookingTime}</div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px', fontSize: '28px', fontWeight: 900 }}>
                    ${calculatedPrice.price_clp.toLocaleString()} CLP
                  </div>
                </div>

                {receivingCard && (
                  <div className="checkout-info">
                    <span className="label">Datos de Transferencia:</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{receivingCard.holder_name}</span>
                      <span style={{ fontSize: '12px', opacity: 0.7 }}>{receivingCard.card_number}</span>
                    </div>
                  </div>
                )}

                <button onClick={handlePayment} disabled={loading} className="btn-submit" style={{ background: '#4ade80' }}>
                  {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="step-content" style={{ textAlign: 'center' }}>
                 <h1 style={{ fontSize: '64px', margin: '20px 0' }}>🤙</h1>
                 <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>¡Sesión Confirmada!</h2>
                 <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                   Tu reserva para el día <b>{bookingDate}</b> ha sido procesada.<br/>
                   Te enviamos un correo con los detalles.
                 </p>
                 <Link href="/" className="btn-submit" style={{ marginTop: '30px', display: 'block', textDecoration: 'none', background: '#38bdf8' }}>Volver al Inicio</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: '40px', opacity: 0.3, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>
        Wave Surf Club © 2026 — Reserva de Clases y Coaching
      </footer>
    </div>
  );
}
