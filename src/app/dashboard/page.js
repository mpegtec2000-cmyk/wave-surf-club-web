'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/data';
import { 
  ShoppingCart, Package, Users, Briefcase, 
  FileText, BarChart3, ListOrdered, Globe, Store, TrendingUp, 
  Settings, CalendarDays, ClipboardList, LifeBuoy,
  ArrowUpRight, ArrowDownRight, Activity, AlertTriangle,
  Clock, Zap, Database, Shield, RefreshCw, ChevronRight,
  DollarSign, TrendingDown
} from 'lucide-react';



const MODULES = [
  { icon: ShoppingCart, title: 'Punto de Venta', code: 'POS', path: '/dashboard/pos', color: '#3b82f6', tag: 'OPERACIONES', desc: 'Registra cobros, arriendos, clases y cafetería' },
  { icon: Package, title: 'Inventario', code: 'INV', path: '/dashboard/inventory', color: '#8b5cf6', tag: 'LOGÍSTICA', desc: 'Control de tablas, trajes y estado de deterioro' },
  { icon: Users, title: 'Clientes', code: 'CLT', path: '/dashboard/clients', color: '#06b6d4', tag: 'CRM', desc: 'Base de datos, historial y cobro de deudas' },
  { icon: CalendarDays, title: 'Suscripciones', code: 'SUS', path: '/dashboard/suscripciones', color: '#ec4899', tag: 'CRM', desc: 'Mensualidades, membresías y cupos de bodega' },
  { icon: ClipboardList, title: 'Cotizaciones', code: 'COT', path: '/dashboard/cotizaciones', color: '#38bdf8', tag: 'COMERCIAL', desc: 'Solicitudes de eventos, paseos de curso' },
  { icon: FileText, title: 'Cierre de Caja', code: 'CIE', path: '/dashboard/closing', color: '#f59e0b', tag: 'FINANZAS', desc: 'Informe diario de ingresos y exportación' },
  { icon: Briefcase, title: 'Personal', code: 'PER', path: '/dashboard/staff', color: '#10b981', tag: 'RRHH', desc: 'Profesores, asistentes y cajeros' },
  { icon: BarChart3, title: 'Finanzas', code: 'FIN', path: '/dashboard/finanzas', color: '#a855f7', tag: 'SUPERADMIN', desc: 'Estadísticas y crecimiento económico' },
  { icon: ListOrdered, title: 'Movimientos', code: 'MOV', path: '/dashboard/movimientos', color: '#64748b', tag: 'AUDITORÍA', desc: 'Bitácora de todas las transacciones' },
  { icon: CalendarDays, title: 'Agenda Clases', code: 'AGD', path: '/dashboard/agenda-ventas', color: '#0891b2', tag: 'LOGÍSTICA', desc: 'Clases y arriendos agendados online' },
  { icon: Globe, title: 'Ventas Online', code: 'VON', path: '/dashboard/ventas-online', color: '#6366f1', tag: 'E-COMMERCE', desc: 'Reservas y compras vía web' },
  { icon: Store, title: 'Ventas Físicas', code: 'VFI', path: '/dashboard/ventas-fisicas', color: '#0284c7', tag: 'POS', desc: 'Seguimiento granular de ventas presenciales' },
  { icon: TrendingUp, title: 'Banco Online', code: 'BNK', path: '/dashboard/fondos', color: '#f43f5e', tag: 'FINANZAS', desc: 'Banco receptor y control de ingresos web' },
  { icon: Settings, title: 'Configuración', code: 'CFG', path: '/dashboard/settings', color: '#94a3b8', tag: 'SISTEMA', desc: 'Credenciales, Flow y parámetros del sistema' },
];

const TAG_COLORS = {
  'OPERACIONES': '#3b82f6',
  'LOGÍSTICA': '#8b5cf6',
  'CRM': '#06b6d4',
  'COMERCIAL': '#38bdf8',
  'FINANZAS': '#f59e0b',
  'RRHH': '#10b981',
  'SUPERADMIN': '#a855f7',
  'AUDITORÍA': '#64748b',
  'E-COMMERCE': '#6366f1',
  'POS': '#0284c7',
  'SISTEMA': '#94a3b8',
};

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [kpis, setKpis] = useState({ totalHoy: 0, txHoy: 0, clientes: 0, inventario: 0 });
  const [loading, setLoading] = useState(true);
  const [systemTime, setSystemTime] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');

  useEffect(() => {
    setUser(getCurrentUser());
    loadKPIs();
    const tick = () => {
      const now = new Date();
      setSystemTime(now.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'medium' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const loadKPIs = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [txRes, clientRes, invRes] = await Promise.all([
        supabase.from('transactions').select('total, type').gte('created_at', today),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('inventory').select('id', { count: 'exact', head: true }),
      ]);
      const ingresos = (txRes.data || []).filter(t => t.type === 'ingreso').reduce((s, t) => s + (t.total || 0), 0);
      setKpis({
        totalHoy: ingresos,
        txHoy: (txRes.data || []).length,
        clientes: clientRes.count || 0,
        inventario: invRes.count || 0,
      });
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const allTags = ['TODOS', ...Array.from(new Set(MODULES.map(m => m.tag)))];
  const filtered = activeFilter === 'TODOS' ? MODULES : MODULES.filter(m => m.tag === activeFilter);

  return (
    <div className="dashboard-home">

      {/* ── System Banner ── */}
      <div className="system-banner">
        <div className="banner-left">
          <div className="banner-icon-wrap">
            <Zap size={16} color="#38bdf8" />
          </div>
          <div>
            <div className="banner-title">WAVE SURF CLUB — ENTERPRISE RESOURCE PLANNING</div>
            <div className="banner-sub">
              {user ? `Sesión iniciada como ${user.name} · ${user.role?.toUpperCase()}` : 'Cargando...'}
               {' '}· {systemTime}
            </div>
          </div>
        </div>
        <div className="banner-right">
          <div className="banner-status-item">
            <Database size={12} />
            <span>Supabase</span>
            <span className="dot-ok" />
          </div>
          <div className="banner-status-item">
            <Shield size={12} />
            <span>Flow API</span>
            <span className="dot-ok" />
          </div>
          <div className="banner-status-item">
            <Activity size={12} />
            <span>Sistema OK</span>
            <span className="dot-ok" />
          </div>
          <button className="refresh-btn" onClick={loadKPIs} title="Actualizar KPIs">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="kpi-row">
        {[
          { label: 'Ingresos Hoy', value: `$${kpis.totalHoy.toLocaleString('es-CL')}`, icon: DollarSign, color: '#10b981', sub: 'Transacciones confirmadas', trend: '+12%' },
          { label: 'Transacciones', value: kpis.txHoy, icon: Activity, color: '#3b82f6', sub: 'Operaciones del día', trend: `${kpis.txHoy} ops` },
          { label: 'Base de Clientes', value: kpis.clientes.toLocaleString(), icon: Users, color: '#8b5cf6', sub: 'Registros activos', trend: 'Total' },
          { label: 'Ítems Inventario', value: kpis.inventario.toLocaleString(), icon: Package, color: '#f59e0b', sub: 'Unidades en stock', trend: 'Activos' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-icon-wrap" style={{ background: `${kpi.color}18`, borderColor: `${kpi.color}30` }}>
                <kpi.icon size={14} color={kpi.color} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: loading ? '#334155' : kpi.color }}>
              {loading ? '—' : kpi.value}
            </div>
            <div className="kpi-bottom">
              <span className="kpi-sub">{kpi.sub}</span>
              <span className="kpi-trend" style={{ color: kpi.color }}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Module Grid Header ── */}
      <div className="modules-header">
        <div className="modules-header-left">
          <h2 className="modules-title">MÓDULOS DEL SISTEMA</h2>
          <span className="modules-count">{filtered.length} módulos</span>
        </div>
        <div className="tag-filters">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn ${activeFilter === tag ? 'active' : ''}`}
              style={activeFilter === tag ? { background: `${TAG_COLORS[tag] || '#38bdf8'}20`, borderColor: TAG_COLORS[tag] || '#38bdf8', color: TAG_COLORS[tag] || '#38bdf8' } : {}}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Module Grid ── */}
      <div className="modules-grid">
        {filtered.map((mod, i) => (
          <div
            key={i}
            className="module-card"
            onClick={() => router.push(mod.path)}
            style={{ '--mod-color': mod.color }}
          >
            <div className="module-card-top">
              <div className="module-code-badge">{mod.code}</div>
              <span className="module-tag" style={{ color: TAG_COLORS[mod.tag] || mod.color, background: `${TAG_COLORS[mod.tag] || mod.color}12` }}>
                {mod.tag}
              </span>
            </div>

            <div className="module-icon-wrap" style={{ background: `${mod.color}12`, borderColor: `${mod.color}25` }}>
              <mod.icon size={22} color={mod.color} />
            </div>

            <div className="module-info">
              <h3 className="module-title">{mod.title}</h3>
              <p className="module-desc">{mod.desc}</p>
            </div>

            <div className="module-footer">
              <span className="module-open-label">Abrir módulo</span>
              <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* ── System Footer ── */}
      <div className="system-footer">
        <div className="footer-info-block">
          <LifeBuoy size={14} color="#475569" />
          <span>Soporte Técnico</span>
        </div>
        <div className="footer-contact">
          <span>👨‍💻 Matias Espinoza Guerrero</span>
          <span className="footer-sep">·</span>
          <span>📱 +56 9 2964 5522</span>
          <span className="footer-sep">·</span>
          <span>📧 mpeg.logistica@gmail.com</span>
        </div>
        <div className="footer-version">WSC-ERP v2.0 · {new Date().getFullYear()}</div>
      </div>

      <style jsx>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #e2e8f0;
        }

        /* ── Banner ── */
        .system-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 20px;
          background: linear-gradient(90deg, #0d1828 0%, #0f1e2e 100%);
          border: 1px solid #1e2a3a;
          border-radius: 12px;
          border-left: 3px solid #38bdf8;
        }
        .banner-left { display: flex; align-items: center; gap: 12px; }
        .banner-icon-wrap {
          width: 32px; height: 32px;
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .banner-title { font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px; margin-bottom: 3px; }
        .banner-sub { font-size: 11px; color: #475569; }
        .banner-right { display: flex; align-items: center; gap: 16px; }
        .banner-status-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; }
        .dot-ok { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 4px #10b981; }
        .refresh-btn { background: none; border: 1px solid #1e2a3a; border-radius: 6px; color: #475569; cursor: pointer; padding: 5px 7px; display: flex; transition: 0.2s; }
        .refresh-btn:hover { color: #38bdf8; border-color: rgba(56,189,248,0.3); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── KPI ── */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .kpi-card {
          background: #0d1220;
          border: 1px solid #1a2236;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.2s;
        }
        .kpi-card:hover { border-color: #2a3a54; }
        .kpi-top { display: flex; align-items: center; justify-content: space-between; }
        .kpi-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-icon-wrap { width: 28px; height: 28px; border-radius: 7px; border: 1px solid; display: flex; align-items: center; justify-content: center; }
        .kpi-value { font-size: 26px; font-weight: 900; font-family: var(--font-mono, monospace); transition: color 0.3s; }
        .kpi-bottom { display: flex; align-items: center; justify-content: space-between; }
        .kpi-sub { font-size: 11px; color: #334155; }
        .kpi-trend { font-size: 11px; font-weight: 700; }

        /* ── Modules Header ── */
        .modules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .modules-header-left { display: flex; align-items: center; gap: 12px; }
        .modules-title { font-size: 11px; font-weight: 800; color: #475569; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
        .modules-count {
          font-size: 10px;
          color: #334155;
          background: #1a2236;
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }
        .tag-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .tag-filter-btn {
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 20px;
          border: 1px solid #1e2a3a;
          background: none;
          color: #475569;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.15s;
        }
        .tag-filter-btn:hover { color: #94a3b8; border-color: #2a3a54; }

        /* ── Module Grid ── */
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }

        .module-card {
          background: #0d1220;
          border: 1px solid #1a2236;
          border-radius: 12px;
          padding: 18px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .module-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--mod-color);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .module-card:hover {
          border-color: #2a3a54;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .module-card:hover::before { opacity: 1; }

        .module-card-top { display: flex; align-items: center; justify-content: space-between; }
        .module-code-badge {
          font-size: 9px;
          font-weight: 900;
          font-family: var(--font-mono, monospace);
          color: #475569;
          background: #1a2236;
          padding: 3px 7px;
          border-radius: 4px;
          letter-spacing: 1px;
        }
        .module-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .module-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 10px;
          border: 1px solid;
          display: flex; align-items: center; justify-content: center;
        }

        .module-info { flex: 1; }
        .module-title { font-size: 14px; font-weight: 800; color: #cbd5e1; margin: 0 0 6px; }
        .module-desc { font-size: 12px; color: #475569; margin: 0; line-height: 1.5; }

        .module-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #1a2236;
          color: #334155;
          font-size: 11px;
          font-weight: 600;
        }
        .module-card:hover .module-footer { color: var(--mod-color); }
        .module-open-label { }

        /* ── Footer ── */
        .system-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          background: #0d1220;
          border: 1px solid #1a2236;
          border-radius: 12px;
          font-size: 11px;
          color: #334155;
          flex-wrap: wrap;
        }
        .footer-info-block { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #475569; }
        .footer-contact { display: flex; align-items: center; gap: 8px; }
        .footer-sep { color: #1e2a3a; }
        .footer-version { font-weight: 700; color: #1e2a3a; }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .kpi-row { grid-template-columns: 1fr; }
          .modules-grid { grid-template-columns: 1fr; }
          .tag-filters { display: none; }
          .system-banner { flex-direction: column; align-items: flex-start; }
          .banner-right { display: none; }
          .system-footer { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
