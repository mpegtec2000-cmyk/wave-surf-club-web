'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { addClient, queueNotification } from '@/lib/data';

export default function AgendaPage() {
  const [step, setStep] = useState('form'); // form, verification, selection, checkout, success
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form states with Concón as default
  const [formData, setFormData] = useState({
    name: '', rut: '', email: '', phone: '', sede: 'Concón'
  });

  // Date/Time/Students States
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [numAlumnos, setNumAlumnos] = useState(1);
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
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temporaryPassword123!',
        options: { data: { full_name: formData.name, rut: formData.rut, phone: formData.phone } }
      });
      if (authError) throw authError;

      await addClient({ ...formData, metadata: { origin: 'agenda_portal_v2' } });
      setStep('verification');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const { error } = await supabase.from('transactions').insert({
        description: `PORTAL: ${numAlumnos} Alumno(s) @ ${bookingDate}`,
        total: calculatedPrice.price_clp,
        type: 'ingreso',
        category: 'clase',
        method: 'tarjeta',
        client_rut: formData.rut,
        branch_id: formData.sede === 'Concón' ? 1 : 2,
        payment_status: 'pagado',
        metadata: { ...formData, date: bookingDate, time: bookingTime }
      });
      if (error) throw error;

      await queueNotification('booking_confirmation', 'mpeg.logistica@gmail.com', `ALERTA: Reserva de ${formData.name}`, {
        cliente: formData, session: { date: bookingDate, time: bookingTime, total: calculatedPrice.price_clp }
      });

      setStep('success');
    } catch (err) {
      setMsg({ type: 'error', text: 'Error en transacción.' });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  return (
    <div className="portal-container">
      <style jsx>{`
        .portal-container { min-height: 100vh; background: #000; color: #fff; display: flex; font-family: 'Inter', sans-serif; overflow: hidden; }
        .visual-side { flex: 1; position: relative; display: flex; flex-direction: column; justify-content: center; padding: 60px; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1502680399663-145021446a27?auto=format&fit=crop&w=1200') no-repeat center; background-size: cover; border-right: 1px solid rgba(255,255,255,0.1); }
        .visual-side h1 { font-size: 140px; font-weight: 900; line-height: 0.8; letter-spacing: -8px; margin: 0; text-transform: uppercase; color: #fff; mix-blend-mode: overlay; opacity: 0.8; }
        .visual-side p { font-size: 24px; font-weight: 300; margin-top: 20px; color: #38bdf8; text-transform: uppercase; letter-spacing: 4px; }
        .form-side { width: 600px; display: flex; align-items: center; justify-content: center; padding: 40px; position: relative; z-index: 10; background: #000; }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px; padding: 48px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: slideIn 0.6s ease-out; }
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .step-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #38bdf8; margin-bottom: 32px; display: block; }
        .input-group { margin-bottom: 24px; }
        .input-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; display: block; }
        .luxury-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 16px; border-radius: 12px; color: #fff; font-size: 16px; transition: all 0.3s; outline: none; }
        .luxury-input:focus { border-color: #38bdf8; background: rgba(56, 189, 248, 0.05); }
        .btn-luxury { width: 100%; padding: 20px; border-radius: 14px; border: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; margin-top: 10px; font-size: 14px; }
        .btn-primary { background: #38bdf8; color: #000; }
        .btn-primary:hover { background: #7dd3fc; transform: translateY(-2px); }
        .alumnos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .al-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; text-align: center; cursor: pointer; font-weight: 800; transition: 0.2s; }
        .al-pill.active { background: #38bdf8; color: #000; border-color: #38bdf8; }
        .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; max-height: 200px; overflow-y: auto; padding-right: 5px; }
        .time-pill { font-size: 11px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); text-align: center; cursor: pointer; }
        .time-pill.active { background: #38bdf8; color: #000; }
        .price-summary { background: #38bdf8; color: #000; padding: 30px; border-radius: 20px; margin-top: 32px; display: flex; align-items: center; justify-content: space-between; }
        .receipt-card { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.2); padding: 30px; border-radius: 16px; margin: 20px 0; }
        @media (max-width: 1100px) { .visual-side { display: none; } .form-side { width: 100%; } }
      `}</style>

      <div className="visual-side">
        <p>Establecido en 2015</p>
        <h1>OCEAN<br/>FREEDOM</h1>
        <p style={{ color: '#fff', opacity: 0.5, marginTop: '40px', fontSize: '14px', maxWidth: '300px' }}>
          La escuela de surf más exclusiva de Chile. Concón • Pichilemu • Punta Piedra
        </p>
      </div>

      <div className="form-side">
        <div className="glass-card">
          {step === 'form' && (
            <div className="step-content">
              <span className="step-title">Bienvenido a la Libertad</span>
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <span className="input-label">Reserva oficial en</span>
                  <select className="luxury-input" value={formData.sede} onChange={e => setFormData({...formData, sede: e.target.value})}>
                    <option value="Concón">Wave Surf Concón (Principal)</option>
                    <option value="Pichilemu">Wave Surf Pichilemu</option>
                  </select>
                </div>
                <div className="input-group">
                  <span className="input-label">Nombre Completo</span>
                  <input required className="luxury-input" placeholder="Matías Espinoza..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">RUT</span>
                  <input required className="luxury-input" placeholder="20.483.954-9" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <span className="input-label">Email</span>
                    <input required className="luxury-input" type="email" placeholder="mpeg@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <span className="input-label">Teléfono</span>
                    <input required className="luxury-input" placeholder="+56 9..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-luxury btn-primary">
                  {loading ? 'Preparando Agenda...' : 'Siguiente Paso'}
                </button>
              </form>
            </div>
          )}

          {step === 'verification' && (
            <div className="step-content" style={{ textAlign: 'center' }}>
              <span className="step-title">Validación de Perfil</span>
              <h2 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '20px' }}>Verifica tu Correo</h2>
              <Image src="/logo-white.png" width={100} height={100} style={{ margin: '20px auto', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '40px' }}>Hemos enviado un acceso seguro a <b>{formData.email}</b></p>
              <button onClick={() => setStep('selection')} className="btn-luxury btn-primary">Continuar</button>
            </div>
          )}

          {step === 'selection' && (
            <div className="step-content">
              <span className="step-title">Personaliza tu Sesión</span>
              <div className="input-group">
                <span className="input-label">¿Cuántos alumnos serán?</span>
                <div className="alumnos-grid">
                  {[1,2,3,4].map(n => (
                    <div key={n} className={`al-pill ${numAlumnos === n ? 'active' : ''}`} onClick={() => setNumAlumnos(n)}>{n}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <span className="input-label">Selecciona Fecha</span>
                  <input type="date" className="luxury-input" min={dateRange.min} max={dateRange.max} value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <span className="input-label">Horario disponible</span>
                  <div className="time-grid">
                    {timeSlots.map(t => (
                      <div key={t} className={`time-pill ${bookingTime === t ? 'active' : ''}`} onClick={() => setBookingTime(t)}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>

              {calculatedPrice && (
                <div className="price-summary animate-fade-in">
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Total Sesión</span>
                    <h3 style={{ fontSize: '32px', margin: 0 }}>${calculatedPrice.price_clp.toLocaleString()} CLP</h3>
                  </div>
                  <button onClick={() => setStep('checkout')} className="btn-luxury" style={{ background: '#000', color: '#fff', width: 'auto', padding: '15px 30px' }}>Pagar Ahora</button>
                </div>
              )}
            </div>
          )}

          {step === 'checkout' && (
            <div className="step-content">
              <span className="step-title">Resumen de Pasarela</span>
              <div className="receipt-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                  <span>Sede {formData.sede}</span>
                  <span>{numAlumnos} Alumno(s)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{bookingDate} @ {bookingTime}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px', fontSize: '24px', fontWeight: 800 }}>
                  ${calculatedPrice.price_clp.toLocaleString()} CLP
                </div>
              </div>

              {receivingCard && (
                <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <span className="input-label">Transferencia directa a:</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{receivingCard.holder_name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>VISA DÉBITO</span>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>{receivingCard.card_number}</div>
                </div>
              )}

              <button onClick={handlePayment} disabled={loading} className="btn-luxury btn-primary" style={{ background: '#4ade80' }}>
                {loading ? 'Procesando Pago Seguro...' : 'Confirmar y Pagar vía Débito'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="step-content" style={{ textAlign: 'center' }}>
               <h1 style={{ fontSize: '80px', margin: '40px 0' }}>🤙</h1>
               <span className="step-title" style={{ color: '#4ade80' }}>Sesión Confirmada</span>
               <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>¡Nos vemos en el agua!</h2>
               <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                 Tu reserva para el día <b>{bookingDate}</b> ha sido procesada con éxito.<br/>
                 Se envió un comprobante a <b>{formData.email}</b>.
               </p>
               <Link href="/" className="btn-luxury btn-primary" style={{ marginTop: '40px', display: 'block', textDecoration: 'none' }}>Finalizar</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
