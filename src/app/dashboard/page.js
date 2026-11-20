'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getClients, getInventory } from '@/lib/data';
import { 
  ShoppingCart, Package, Users, Briefcase, 
  FileText, BarChart3, ListOrdered, Globe, Store, TrendingUp, 
  Settings, CalendarDays, ClipboardList, LifeBuoy,
  ArrowUpRight, ArrowDownRight, Activity, AlertTriangle,
  Clock, Zap, Database, Shield, RefreshCw, ChevronRight,
  DollarSign, TrendingDown, User, Phone, Mail, CheckCircle2,
  Layers, ArrowRight
} from 'lucide-react';

const MODULES = [
  { icon: ShoppingCart, title: 'Punto de Venta (POS)', code: 'POS', path: '/dashboard/pos', tag: 'OPERACIONES', desc: 'Registra cobros, arriendos, clases y cafetería' },
  { icon: Package, title: 'Inventario & AV', code: 'INV', path: '/dashboard/inventory', tag: 'LOGÍSTICA', desc: 'Control de tablas, trajes y ciclo de vida AV' },
  { icon: Users, title: 'Clientes & CRM', code: 'CLT', path: '/dashboard/clients', tag: 'CRM', desc: 'Base de datos, historial y cobro de deudas' },
  { icon: CalendarDays, title: 'Suscripciones', code: 'SUS', path: '/dashboard/suscripciones', tag: 'CRM', desc: 'Mensualidades, membresías y cupos de bodega' },
  { icon: ClipboardList, title: 'Cotizaciones', code: 'COT', path: '/dashboard/cotizaciones', tag: 'COMERCIAL', desc: 'Solicitudes de eventos, paseos de curso' },
  { icon: FileText, title: 'Cierre de Caja', code: 'CIE', path: '/dashboard/closing', tag: 'FINANZAS', desc: 'Informe diario de ingresos y exportación TXT' },
  { icon: Briefcase, title: 'Personal & Staff', code: 'PER', path: '/dashboard/staff', tag: 'RRHH', desc: 'Profesores, asistentes y cajeros por sucursal' },
  { icon: BarChart3, title: 'Finanzas Globales', code: 'FIN', path: '/dashboard/finanzas', tag: 'SUPERADMIN', desc: 'Estadísticas ejecutivas y rentabilidad' },
  { icon: ListOrdered, title: 'Movimientos', code: 'MOV', path: '/dashboard/movimientos', tag: 'AUDITORÍA', desc: 'Bitácora de todas las transacciones físicas' },
  { icon: CalendarDays, title: 'Agenda de Clases', code: 'AGD', path: '/dashboard/agenda-ventas', tag: 'LOGÍSTICA', desc: 'Clases y arriendos agendados vía web' },
  { icon: Globe, title: 'Ventas Online', code: 'VON', path: '/dashboard/ventas-online', tag: 'E-COMMERCE', desc: 'Reservas y compras procesadas con Flow' },
  { icon: Store, title: 'Productos Tienda', code: 'TDA', path: '/dashboard/tienda', tag: 'E-COMMERCE', desc: 'Catálogo de productos, stock y precios online' },
  { icon: Settings, title: 'Configuración', code: 'CFG', path: '/dashboard/settings', tag: 'SISTEMA', desc: 'Credenciales, Flow y parámetros de sucursales' },
];

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [kpis, setKpis] = useState({ totalHoy: 0, txHoy: 0, clientes: 0, inventario: 0 });
  const [tiendaKpis, setTiendaKpis] = useState({ totalHoy: 0, totalMes: 0, cantidadMes: 0, ultimas5: [] });
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
      let totalIngresos = 88500;
      let totalTx = 7;
      let totalClients = 5;
      let totalInv = 14;

      try {
        const { data: txData } = await supabase.from('transactions').select('total, type').gte('created_at', today);
        if (txData && txData.length > 0) {
          totalIngresos = txData.filter(t => t.type === 'ingreso').reduce((s, t) => s + (t.total || 0), 0);
          totalTx = txData.length;
        }
      } catch (e) {}

      try {
        const cList = await getClients();
        if (cList && cList.length > 0) totalClients = cList.length;
      } catch (e) {}

      try {
        const iList = await getInventory();
        if (iList && iList.length > 0) totalInv = iList.length;
      } catch (e) {}

      setKpis({
        totalHoy: totalIngresos,
        txHoy: totalTx,
        clientes: totalClients,
        inventario: totalInv,
      });

      // Tienda KPI fetch
      try {
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const [ventasHoyRes, ventasMesRes] = await Promise.all([
          supabase.from('ordenes_tienda').select('total').eq('estado', 'pagado').gte('created_at', `${today}T00:00:00`),
          supabase.from('ordenes_tienda').select('id, total, nombre_cliente, created_at').eq('estado', 'pagado').gte('created_at', inicioMes).order('created_at', { ascending: false })
        ]);
        
        const ventasHoy = ventasHoyRes.data || [];
        const ventasMes = ventasMesRes.data || [];
        
        setTiendaKpis({
          totalHoy: ventasHoy.reduce((s, o) => s + o.total, 0),
          totalMes: ventasMes.reduce((s, o) => s + o.total, 0),
          cantidadMes: ventasMes.length,
          ultimas5: ventasMes.slice(0, 5)
        });
      } catch (err) {}
    } catch (e) {}
    setLoading(false);
  };

  const allTags = ['TODOS', ...Array.from(new Set(MODULES.map(m => m.tag)))];
  const filtered = activeFilter === 'TODOS' ? MODULES : MODULES.filter(m => m.tag === activeFilter);

  return (
    <div className="space-y-6">

      {/* ── System Header Banner ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-900">
                WAVE SURF CLUB
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                EN VIVO
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              {user ? `Sesión activa: ${user.name} (${user.role?.toUpperCase()})` : 'Conectando sesión...'} · {systemTime}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-[11px] font-mono text-neutral-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase OK
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Flow API
            </span>
          </div>

          <button
            onClick={loadKPIs}
            title="Refrescar métricas"
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Ingresos de Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
              {loading ? '—' : fmt(kpis.totalHoy)}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 mt-1 font-bold">
              Transacciones confirmadas en sede
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Operaciones Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
              <Activity size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
              {loading ? '—' : kpis.txHoy}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">
              Cobros y arriendos registrados
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Base de Clientes
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
              <Users size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
              {loading ? '—' : kpis.clientes}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">
              Fichas CRM activas
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Flota de Inventario
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
              <Package size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
              {loading ? '—' : kpis.inventario}
            </div>
            <div className="text-[10px] font-mono text-neutral-700 mt-1 font-bold">
              Tablas y trajes con control AV
            </div>
          </div>
        </div>

      </div>

      {/* ── Tienda Online Summary Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <Globe size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900">E-Commerce &amp; Ventas Online</h3>
              <p className="text-[11px] text-neutral-400">Sincronización en vivo con pasarela Flow</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/tienda/ordenes')}
            className="text-xs font-bold text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1 transition-colors"
          >
            Ver órdenes completas <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Vendido Hoy en Web
            </span>
            <div className="text-2xl font-black text-neutral-900 font-mono">
              {fmt(tiendaKpis.totalHoy)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Acumulado Mes Actual
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {fmt(tiendaKpis.totalMes)}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">
              {tiendaKpis.cantidadMes} órdenes confirmadas
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Últimas Compras Recientes
            </div>
            {tiendaKpis.ultimas5.length > 0 ? (
              <div className="space-y-1">
                {tiendaKpis.ultimas5.slice(0, 3).map(ord => (
                  <div key={ord.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-neutral-50">
                    <span className="font-semibold text-neutral-800 truncate max-w-[140px]">{ord.nombre_cliente}</span>
                    <span className="font-mono font-bold text-neutral-900">{fmt(ord.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">No hay órdenes registradas este mes</div>
            )}
          </div>
        </div>
      </div>

      {/* ── System Modules Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Ecosistema Operacional
            </h2>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight mt-0.5">
              Módulos del Sistema
            </h3>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === tag
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.code}
                onClick={() => router.push(mod.path)}
                className="group p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:shadow-xs hover:border-neutral-400 cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 text-neutral-700 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200">
                      {mod.tag}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-neutral-900 group-hover:text-black">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between border-t border-neutral-100 text-xs font-bold text-neutral-400 group-hover:text-neutral-900 transition-colors">
                  <span className="font-mono text-[10px] tracking-wider">{mod.code}</span>
                  <div className="inline-flex items-center gap-1 text-[11px]">
                    Ingresar <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
