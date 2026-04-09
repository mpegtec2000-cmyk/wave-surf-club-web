'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n-context';
import { 
  TrendingUp, 
  CreditCard, 
  User, 
  Calendar, 
  Building2, 
  Hash, 
  Lock, 
  Save, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * PÁGINA DE FONDOS
 * -----------------
 * Gestiona los ingresos provenientes del portal web (Agenda tus Clases)
 * y permite configurar la cuenta receptora de dichos fondos.
 */
export default function FondosPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Datos Financieros (Ventas Web)
  const [stats, setStats] = useState({
    totalIncome: 0,
    bookingCount: 0,
    recentSales: []
  });

  // Datos de la Tarjeta/Cuenta Receptora
  const [accountData, setAccountData] = useState({
    holder_name: '',
    bank: '',
    card_number: '',
    expiry_date: '',
    cvv: ''
  });

  // Al montar, cargamos las estadísticas y la configuración actual
  useEffect(() => {
    const initPage = async () => {
      await fetchFinancials();
      await fetchAccountSettings();
      setLoading(false);
    };
    initPage();
  }, []);

  const fetchFinancials = async () => {
    try {
      // Consultamos transacciones exitosas de la web (categoría clase, tipo ingreso)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('category', 'clase')
        .eq('type', 'ingreso')
        .eq('payment_status', 'pagado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const total = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
        setStats({
          totalIncome: total,
          bookingCount: data.length,
          recentSales: data.slice(0, 10) // Mostramos las últimas 10
        });
      }
    } catch (err) {
      console.error('Error fetching financials:', err);
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
      console.error('Error fetching account settings:', err);
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
          description: 'Configuración de cuenta receptora para transacciones de Agenda Web'
        }, { onConflict: 'key' });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Los datos de la cuenta receptora han sido guardados correctamente.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar los cambios.',
        background: '#0f172a',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-muted)' }}>
      <div className="animate-pulse">Cargando datos de fondos...</div>
    </div>
  );

  return (
    <div className="fondos-container">
      {/* Cards de Resumen */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Vendido (Web Classes)</span>
            <div className="stat-value">${stats.totalIncome.toLocaleString()}</div>
          </div>
          <div className="stat-badge">
            <ArrowUpRight size={12} />
            CONECTADO
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Reservas Procesadas</span>
            <div className="stat-value">{stats.bookingCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Ticket Promedio Web</span>
            <div className="stat-value">
              ${stats.bookingCount > 0 ? Math.round(stats.totalIncome / stats.bookingCount).toLocaleString() : 0}
            </div>
          </div>
        </div>
      </div>

      <div className="fondos-grid">
        {/* Formulario de Configuración de Cuenta */}
        <div className="fondos-section">
          <div className="section-header">
            <CreditCard className="section-icon" size={24} />
            <div>
              <h3>Cuenta Receptora de Clases</h3>
              <p>Esta cuenta es la que verá el cliente para transferir el pago de su reserva.</p>
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
                  placeholder="Ej: Matías Espinoza"
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
                  placeholder="Ej: Banco de Chile"
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
                placeholder="000 00000 000"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Calendar size={14} /> Fecha Vencimiento (Fec.)</label>
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
                <label><Lock size={14} /> Codigo / Clave Transferencia</label>
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

        {/* Listado de Ventas Recientes (Viene de Agenda Web) */}
        <div className="fondos-section">
          <div className="section-header">
            <TrendingUp className="section-icon text-accent" size={24} />
            <div>
              <h3>Ventas Recientes (Agenda Web)</h3>
              <p>Historial de ingresos validados por el sistema de reservas.</p>
            </div>
          </div>

          <div className="sales-list">
            {stats.recentSales.length > 0 ? stats.recentSales.map(sale => (
              <div key={sale.id} className="sale-item">
                <div className="sale-details">
                  <div className="sale-title">{sale.description?.replace('WEB: ', '')}</div>
                  <div className="sale-meta">
                    {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • RUT: {sale.client_rut || 'Sin Ident.'}
                  </div>
                </div>
                <div className="sale-amount">+${sale.total?.toLocaleString()}</div>
              </div>
            )) : (
              <div className="empty-notice">Aún no se registran ventas desde el portal web.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fondos-container { padding: 4px 0; }

        /* --- Cards --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #111827;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }
        .stat-card.accent {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0) 100%);
          border-color: rgba(14, 165, 233, 0.2);
        }
        .stat-icon {
          width: 54px;
          height: 54px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0ea5e9;
        }
        .stat-info { flex: 1; }
        .stat-label { font-size: 13px; color: #94a3b8; display: block; margin-bottom: 4px; }
        .stat-value { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -1px; }
        .stat-badge {
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          font-size: 9px;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 20px;
          display: flex; align-items: center; gap: 4px;
        }

        /* --- Grid --- */
        .fondos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) { .fondos-grid { grid-template-columns: 1fr; } }

        .fondos-section {
          background: #111827;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 30px;
        }
        .section-header { display: flex; gap: 16px; margin-bottom: 32px; }
        .section-icon { color: #94a3b8; }
        .text-accent { color: #0ea5e9 !important; }
        .section-header h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
        .section-header p { font-size: 13px; color: #94a3b8; margin: 6px 0 0; line-height: 1.5; }

        /* --- Form --- */
        .account-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 12px; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .form-input {
          background: #030712;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px;
          border-radius: 10px;
          color: #fff;
          outline: none;
          transition: 0.3s;
        }
        .form-input:focus { border-color: #0ea5e9; background: rgba(14, 165, 233, 0.05); }
        .btn-save {
          background: #0ea5e9;
          color: #fff;
          padding: 16px;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          border: none; cursor: pointer; transition: 0.3s; margin-top: 10px;
        }
        .btn-save:hover { background: #fff; color: #000; transform: translateY(-2px); }

        /* --- List --- */
        .sales-list { display: flex; flex-direction: column; gap: 12px; }
        .sale-item {
          background: rgba(255, 255, 255, 0.02);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; justify-content: space-between; align-items: center;
          transition: 0.2s;
        }
        .sale-item:hover { transform: translateX(5px); border-color: #0ea5e9; }
        .sale-title { font-size: 14px; font-weight: 700; color: #fff; }
        .sale-meta { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sale-amount { color: #4ade80; font-weight: 900; font-size: 16px; font-family: 'Mono', monospace; }
        .empty-notice { color: #64748b; font-size: 14px; text-align: center; padding: 60px 0; font-style: italic; opacity: 0.5; }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}
