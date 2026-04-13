'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n-context';
import { 
  Globe, 
  CreditCard, 
  User, 
  Calendar, 
  Building2, 
  Hash, 
  Lock, 
  Save, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Settings2,
  Users2
} from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * PÁGINA: FONDOS - VENTAS POR INTERNET
 * -----------------------------------
 * Control exclusivo de ingresos vía web y configuración de fondo receptor.
 * Estos movimientos son externos a la operación diaria de caja.
 */
export default function FondosPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Datos Financieros (Ventas Internet Exclusivas)
  const [stats, setStats] = useState({
    totalIncome: 0,
    bookingCount: 0,
    recentSales: []
  });

  // Datos de la Tarjeta/Cuenta Receptora (Fondo Interno)
  const [accountData, setAccountData] = useState({
    holder_name: '',
    bank: '',
    card_number: '',
    expiry_date: '',
    cvv: ''
  });

  // Tarifas de Clases (service_pricing)
  const [pricing, setPricing] = useState([]);
  const [pricingSaving, setPricingSaving] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      await fetchFinancials();
      await fetchAccountSettings();
      await fetchPricing();
      setLoading(false);
    };
    initPage();
  }, []);

  const fetchFinancials = async () => {
    try {
      // Consultamos transacciones que vienen del Portal Web
      // Usamos la nueva columna is_web_tx
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_web_tx', true)
        .eq('payment_status', 'pagado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const total = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
        setStats({
          totalIncome: total,
          bookingCount: data.length,
          recentSales: data.slice(0, 15)
        });
      }
    } catch (err) {
      console.error('Error fetching fondos financials:', err);
    }
  };

  const fetchAccountSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'receiving_card_info')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.value) {
        setAccountData(JSON.parse(data.value));
      }
    } catch (err) {
      console.error('Error fetching bank settings:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('service_pricing')
        .select('*')
        .eq('is_active', true)
        .order('alumno_count', { ascending: true });

      if (error) throw error;
      if (data) setPricing(data);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  const handleUpdatePrice = (id, value) => {
    setPricing(prev => prev.map(p => p.id === id ? { ...p, price_clp: parseInt(value) || 0 } : p));
  };

  const handleSavePricing = async () => {
    setPricingSaving(true);
    try {
      const { error } = await supabase
        .from('service_pricing')
        .upsert(pricing.map(p => ({
          id: p.id,
          category: p.category,
          alumno_count: p.alumno_count,
          price_clp: p.price_clp,
          is_active: true
        })));

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Tarifas Actualizadas',
        text: 'Los nuevos precios ya están vigentes en el portal de agenda.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#22c55e'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar las tarifas.',
        background: '#0f172a',
        color: '#fff'
      });
    } finally {
      setPricingSaving(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'receiving_card_info',
          value: JSON.stringify(accountData),
          description: 'Configuración de FONDO RECEPTOR para ventas web (Personal)'
        }, { onConflict: 'key' });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Configuración Guardada',
        text: 'La cuenta receptora de ventas web ha sido actualizada.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la configuración.',
        background: '#0f172a',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
    </div>
  );

  return (
    <div className="fondos-container">
      {/* Header Informativo */}
      <div className="fondos-notice">
        <ShieldCheck size={20} className="shrink-0" />
        <div>
          <strong>Control de Fondos Web:</strong> Estos movimientos corresponden únicamente a transacciones vía internet (Agenda de Clases) y se gestionan independientemente de la caja física.
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon"><Globe size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Totales (Clases Web)</span>
            <div className="stat-value">${stats.totalIncome.toLocaleString('es-CL')}</div>
          </div>
          <div className="stat-badge">EN LÍNEA</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Reservas Procesadas</span>
            <div className="stat-value">{stats.bookingCount}</div>
          </div>
        </div>
      </div>

      <div className="fondos-section-grid">
        {/* Configuración de Tarjeta / Fondo Receptor */}
        <div className="fondos-card">
          <div className="fondos-card-header">
            <CreditCard size={24} className="text-sky-500" />
            <div>
              <h3>Cuenta Receptora de Pagos</h3>
              <p>Datos de la tarjeta que recibirá los ingresos de la agenda web.</p>
            </div>
          </div>

          <form className="account-form" onSubmit={handleSaveAccount}>
            <div className="form-row">
              <div className="form-group">
                <label><User size={14} /> Nombre del Titular</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={accountData.holder_name} 
                  onChange={e => setAccountData({...accountData, holder_name: e.target.value})}
                  placeholder="Ej: Paulo Soto"
                  required
                />
              </div>
              <div className="form-group">
                <label><Building2 size={14} /> Banco</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={accountData.bank} 
                  onChange={e => setAccountData({...accountData, bank: e.target.value})}
                  placeholder="Ej: Banco Estado"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label><Hash size={14} /> Número de Cuenta / Tarjeta</label>
              <input 
                type="text" 
                className="form-input" 
                value={accountData.card_number} 
                onChange={e => setAccountData({...accountData, card_number: e.target.value})}
                placeholder="000 0000 0000"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Calendar size={14} /> Fecha Vencimiento</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={accountData.expiry_date} 
                  onChange={e => setAccountData({...accountData, expiry_date: e.target.value})}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div className="form-group">
                <label><Lock size={14} /> Código (CVV)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={accountData.cvv} 
                  onChange={e => setAccountData({...accountData, cvv: e.target.value})}
                  placeholder="***"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Guardando...' : <><Save size={18} /> Guardar Configuración</>}
            </button>
          </form>
        </div>

        {/* Configuración de Tarifas de Clases */}
        <div className="fondos-card">
          <div className="fondos-card-header">
            <Settings2 size={24} className="text-amber-500" />
            <div>
              <h3>Tarifas de Clases (Agenda Online)</h3>
              <p>Modifica el valor CLP según la cantidad de alumnos y el día.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* SEMANA */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Lunes a Viernes (Semana)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pricing.filter(p => p.category === 'SEMANA').map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>
                      <Users2 size={12} style={{ display: 'inline', marginRight: '6px' }} />
                       {p.alumno_count} {p.alumno_count === 1 ? 'Alumno' : 'Alumnos'}
                    </div>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#64748b' }}>$</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ height: '36px', paddingLeft: '20px', textAlign: 'right', fontSize: '13px' }}
                        value={p.price_clp}
                        onChange={e => handleUpdatePrice(p.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINDE */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Sáb, Dom y Festivos (Finde)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pricing.filter(p => p.category === 'FINDE').map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>
                      <Users2 size={12} style={{ display: 'inline', marginRight: '6px' }} />
                       {p.alumno_count} {p.alumno_count === 1 ? 'Alumno' : 'Alumnos'}
                    </div>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#64748b' }}>$</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ height: '36px', paddingLeft: '20px', textAlign: 'right', fontSize: '13px' }}
                        value={p.price_clp}
                        onChange={e => handleUpdatePrice(p.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSavePricing} 
            className="btn-save" 
            disabled={pricingSaving}
            style={{ marginTop: '24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {pricingSaving ? 'Guardando...' : <><Save size={18} /> Actualizar Tarifas Web</>}
          </button>
        </div>

        {/* Historial Reciente */}
        <div className="fondos-card">
          <div className="fondos-card-header">
            <ArrowUpRight size={24} className="text-green-500" />
            <div>
              <h3>Ventas Recientes (Agenda)</h3>
              <p>Últimos ingresos registrados desde la página web.</p>
            </div>
          </div>

          <div className="sales-list">
            {stats.recentSales.length > 0 ? stats.recentSales.map(sale => (
              <div key={sale.id} className="sale-item">
                <div className="sale-details">
                  <div className="sale-title">{sale.description?.replace('WEB: ', '') || 'Reserva de Clase'}</div>
                  <div className="sale-meta">
                    {new Date(sale.created_at).toLocaleDateString()} • {sale.client_rut || 'Cliente Web'}
                  </div>
                </div>
                <div className="sale-amount">+${sale.total?.toLocaleString('es-CL')}</div>
              </div>
            )) : (
              <div className="empty-notice">No hay ventas registradas aún.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
