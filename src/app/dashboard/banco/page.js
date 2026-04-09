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
  ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * PÁGINA: BANCO - VENTAS POR INTERNET
 * -----------------------------------
 * Control exclusivo de ingresos vía web y configuración de fondo receptor.
 * Estos movimientos son externos a la operación diaria de caja.
 */
export default function BancoPage() {
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
      // Consultamos transacciones que vienen del Portal Web
      // Filtramos por origen en metadata o descripción específica
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
      console.error('Error fetching banco financials:', err);
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

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'receiving_card_info',
          value: JSON.stringify(accountData),
          description: 'Configuración de BANCO RECEPTOR para ventas web (Personal)'
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
      <div className="animate-spin" style={{ width: 30, height: 30, border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="banco-container">
      {/* Header Informativo */}
      <div className="banco-notice">
        <ShieldCheck size={20} />
        <div>
          <strong>Control de Ventas Externas:</strong> Estos movimientos corresponden únicamente a transacciones vía internet y no afectan el balance de las cajas físicas de las sedes.
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon"><Globe size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Totales Internet</span>
            <div className="stat-value">${stats.totalIncome.toLocaleString('es-CL')}</div>
          </div>
          <div className="stat-badge">LIVE</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">N° Operaciones Web</span>
            <div className="stat-value">{stats.bookingCount}</div>
          </div>
        </div>
      </div>

      <div className="banco-grid">
        {/* Configuración de Tarjeta / Fondo Recepto */}
        <div className="banco-section">
          <div className="section-header">
            <CreditCard size={24} className="text-accent" />
            <div>
              <h3>Tarjeta Fondo Receptor</h3>
              <p>Define la cuenta que recibirá los pagos directos de la Agenda Web.</p>
            </div>
          </div>

          <form className="account-form" onSubmit={handleSaveAccount}>
            <div className="form-row">
              <div className="form-group">
                <label><User size={14} /> Titular de la Cuenta</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={accountData.holder_name} 
                  onChange={e => setAccountData({...accountData, holder_name: e.target.value})}
                  placeholder="Nombre Apellido"
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
                  placeholder="Banco"
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
                <label><Calendar size={14} /> Vencimiento</label>
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
                <label><Lock size={14} /> Código Seguridad (CVV)</label>
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
              {saving ? 'Guardando...' : <><Save size={18} /> Actualizar Banco Recepto</>}
            </button>
          </form>
        </div>

        {/* Listado de Ventas Internet */}
        <div className="banco-section">
          <div className="section-header">
            <ArrowUpRight size={24} className="text-success" />
            <div>
              <h3>Movimientos Internet</h3>
              <p>Últimos depósitos confirmados desde el portal de agenda.</p>
            </div>
          </div>

          <div className="sales-list">
            {stats.recentSales.length > 0 ? stats.recentSales.map(sale => (
              <div key={sale.id} className="sale-item">
                <div className="sale-details">
                  <div className="sale-title">{sale.description?.replace('WEB: ', '')}</div>
                  <div className="sale-meta">
                    {new Date(sale.created_at).toLocaleDateString()} • {new Date(sale.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="sale-amount">+${sale.total?.toLocaleString('es-CL')}</div>
              </div>
            )) : (
              <div className="empty-notice">Sin movimientos web recientes.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .banco-container { padding: 4px 0; }
        
        .banco-notice {
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.2);
          padding: 16px 20px;
          border-radius: 12px;
          color: #38bdf8;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
        .stat-card.accent { border-color: rgba(14, 165, 233, 0.3); }
        .stat-icon {
          width: 50px; height: 50px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #0ea5e9;
        }
        .stat-info { flex: 1; }
        .stat-label { font-size: 12px; color: #94a3b8; display: block; margin-bottom: 4px; }
        .stat-value { font-size: 26px; font-weight: 800; color: #fff; }
        .stat-badge {
          position: absolute; top: 20px; right: 20px;
          background: rgba(34, 197, 94, 0.1); color: #4ade80;
          font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 20px;
        }

        .banco-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) { .banco-grid { grid-template-columns: 1fr; } }

        .banco-section {
          background: #111827;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 30px;
        }
        .section-header { display: flex; gap: 16px; margin-bottom: 30px; }
        .section-header h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
        .section-header p { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
        .text-accent { color: #0ea5e9; }
        .text-success { color: #4ade80; }

        .account-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 12px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .form-input {
          background: #030712;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px;
          border-radius: 10px;
          color: #fff;
          outline: none;
        }
        .form-input:focus { border-color: #0ea5e9; }
        .btn-save {
          background: #0ea5e9; color: #fff; padding: 16px; border-radius: 12px;
          font-weight: 900; text-transform: uppercase; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .sales-list { display: flex; flex-direction: column; gap: 12px; }
        .sale-item {
          background: rgba(255, 255, 255, 0.02);
          padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; justify-content: space-between; align-items: center;
        }
        .sale-title { font-size: 14px; font-weight: 700; color: #fff; }
        .sale-meta { font-size: 11px; color: #64748b; margin-top: 4px; }
        .sale-amount { color: #4ade80; font-weight: 800; }
        .empty-notice { color: #64748b; text-align: center; padding: 40px 0; font-style: italic; }
      `}</style>
    </div>
  );
}
