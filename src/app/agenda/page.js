'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function AgendaPage() {
  const { addToCart } = useCart();
  const [step, setStep] = useState('form'); // form, selection, confirmar, success
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    sede: 'Concón'
  });

  const [numAlumnos, setNumAlumnos] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const timeSlots = ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];

  const getPrice = () => {
    const base = 25000;
    const discount = numAlumnos > 1 ? 0.9 : 1;
    return {
      price_clp: base * numAlumnos * discount,
      num: numAlumnos
    };
  };

  const calculatedPrice = getPrice();

  const handleRegister = (e) => {
    e.preventDefault();
    setStep('selection');
  };

  const handleGoToConfirm = () => {
    if (!bookingDate || !bookingTime) return;
    setStep('confirmar');
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    addToCart({
      name: `CLASE DE SURF - ${formData.sede}`,
      category: 'Clase / Coaching',
      price: calculatedPrice.price_clp,
      metadata: {
        ...formData,
        date: bookingDate,
        time: bookingTime,
        alumnos: numAlumnos
      }
    });

    setLoading(false);
    setStep('success');
  };

  return (
    <div className="agenda-master">
      <Navbar />
      
      <main className="booking-main">
        <div className="hero-bg">
          <Image src="/fondo-surf.jpg" alt="Background" fill priority style={{ objectFit: 'cover' }} />
          <div className="overlay" />
        </div>

        <div className="booking-card">
          <div className="card-visual">
            <div className="visual-image">
              <Image src="/fondo-escuela.png" alt="School" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className="visual-content">
              <h2 className="celeste-animate">AGENDA TU CLASE CON PROFESIONALES.</h2>
              <p>Únete a la familia Wave Surf Club y vive la experiencia del mar.</p>
            </div>
          </div>

          <div className="card-form">
            <h2 className="portal-title">PORTAL DE RESERVAS</h2>

            {step === 'form' && (
              <form onSubmit={handleRegister} className="anim-fade">
                <span className="label">SELECCIONA TU SEDE</span>
                <div className="sede-selector">
                  {['Punta Piedra', 'Concón', 'Pichilemu'].map(s => (
                    <button 
                      key={s} type="button" 
                      className={`sede-btn ${formData.sede === s ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, sede: s})}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="form-grid">
                  <input required className="input" placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required className="input" placeholder="RUT" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
                  <input required className="input" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input required className="input" placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <button type="submit" className="btn-primary">SIGUIENTE PASO <ChevronRight size={18} /></button>
              </form>
            )}

            {step === 'selection' && (
              <div className="anim-fade">
                <div className="field-group">
                  <span className="label">¿CUÁNTOS ALUMNOS?</span>
                  <div className="alumnos-grid">
                    {[1,2,3,4].map(n => (
                      <button key={n} className={`al-pill ${numAlumnos === n ? 'active' : ''}`} onClick={() => setNumAlumnos(n)}>{n}</button>
                    ))}
                  </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="field-group">
                    <label className="label">FECHA</label>
                    <input type="date" className="input" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="label">HORA</label>
                    <select className="input" value={bookingTime} onChange={e => setBookingTime(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={handleGoToConfirm} disabled={!bookingDate || !bookingTime} className="btn-primary">REVISAR RESUMEN <ChevronRight size={18} /></button>
                <button onClick={() => setStep('form')} className="btn-ghost">Volver</button>
              </div>
            )}

            {step === 'confirmar' && (
              <div className="anim-fade">
                <h3 className="section-subtitle">RESUMEN DE RESERVA</h3>
                <div className="summary-box">
                  <div className="summary-row">
                    <div className="s-info">
                      <strong>Sede {formData.sede}</strong>
                      <span>{numAlumnos} Alumno(s)</span>
                    </div>
                    <span>{bookingDate} @ {bookingTime}</span>
                  </div>
                  <div className="total-row">
                    <span>Monto Total</span>
                    <span>${calculatedPrice.price_clp.toLocaleString()} CLP</span>
                  </div>
                </div>

                <div className="info-alert">
                  <AlertCircle size={18} />
                  <p>Tu clase se añadirá a la bolsa de compras para el pago final.</p>
                </div>

                <button onClick={handleFinalConfirm} disabled={loading} className="btn-primary-blue">
                  {loading ? 'AGREGANDO...' : 'CONFIRMAR Y AÑADIR A LA BOLSA'}
                </button>
                <button onClick={() => setStep('selection')} className="btn-ghost">Editar selección</button>
              </div>
            )}

            {step === 'success' && (
              <div className="anim-fade text-center">
                <div className="success-icon">
                  <CheckCircle2 size={48} color="#000" />
                </div>
                <h2>¡AGREGADO!</h2>
                <div className="mini-card">
                  <div className="row"><span>Sede:</span> <strong>{formData.sede}</strong></div>
                  <div className="row"><span>Monto:</span> <strong className="celeste">${calculatedPrice.price_clp.toLocaleString()}</strong></div>
                </div>
                <Link href="/cart" className="btn-primary-pink">PAGAR AHORA (IR AL CARRO)</Link>
                <Link href="/servicios" className="btn-ghost" style={{ marginTop: '10px' }}>Ver más servicios</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* STYLES INTERNOS PARA ASEGURAR COMPILACION */}
      <style jsx>{`
        .agenda-master { min-height: 100vh; background: #0b1120; color: #fff; padding-top: var(--nav-height); font-family: sans-serif; }
        .booking-main { max-width: 1200px; margin: 0 auto; padding: 60px 20px; position: relative; }
        .hero-bg { position: fixed; inset: 0; z-index: 0; }
        .overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(15,23,42,0.6) 0%, #0b1120 100%); }
        .booking-card { position: relative; z-index: 1; display: grid; grid-template-columns: 450px 1fr; background: #0f172a; border-radius: 32px; overflow: hidden; }
        .card-visual { position: relative; padding: 60px 40px; display: flex; flex-direction: column; justify-content: flex-end; }
        .visual-image { position: absolute; inset: 0; opacity: 0.4; }
        .visual-content { position: relative; z-index: 10; }
        .celeste-animate { color: #38bdf8; font-size: 32px; font-weight: 900; margin-bottom: 20px; }
        .card-form { padding: 60px; background: rgba(15,23,42,0.8); }
        .portal-title { font-size: 14px; font-weight: 900; color: #38bdf8; margin-bottom: 40px; }
        .label { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 12px; display: block; }
        .sede-selector { display: flex; gap: 10px; margin-bottom: 30px; }
        .sede-btn { flex: 1; padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; cursor: pointer; }
        .sede-btn.active { background: #38bdf8; color: #000; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .input { width: 100%; padding: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; }
        .btn-primary, .btn-primary-blue { width: 100%; height: 60px; background: #38bdf8; color: #000; border: none; border-radius: 16px; font-weight: 900; cursor: pointer; margin-top: 10px; }
        .btn-primary-pink { width: 100%; height: 60px; background: #ec4899; color: #fff; border: none; border-radius: 16px; font-weight: 900; text-decoration: none; display: flex; align-items: center; justify-content: center; margin-top: 30px; }
        .btn-ghost { width: 100%; padding: 15px; background: none; border: none; color: #64748b; font-weight: 700; cursor: pointer; text-align: center; }
        .alumnos-grid { display: flex; gap: 10px; margin-bottom: 30px; }
        .al-pill { flex: 1; height: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .al-pill.active { background: #38bdf8; color: #000; }
        .summary-box { background: rgba(255,255,255,0.03); border-radius: 20px; padding: 30px; margin-bottom: 25px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .total-row { display: flex; justify-content: space-between; font-size: 24px; font-weight: 900; }
        .info-alert { display: flex; gap: 10px; color: #94a3b8; font-size: 13px; margin-bottom: 30px; }
        .success-icon { width: 80px; height: 80px; background: #4ade80; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; }
        .mini-card { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; margin-top: 30px; }
        .mini-card .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .celeste { color: #38bdf8; }
        .anim-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <footer style={{ textAlign: 'center', paddingBottom: '40px', opacity: 0.3, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>
        Wave Surf Club © 2026
      </footer>
    </div>
  );
}
