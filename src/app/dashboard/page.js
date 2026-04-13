'use client';

import { useRouter } from 'next/navigation';
import { 
  LifeBuoy, Info, ShoppingCart, Package, Users, Briefcase, 
  FileText, BarChart3, ListOrdered, Globe, Store, TrendingUp, 
  Settings, CalendarDays, ClipboardList 
} from 'lucide-react';

const MODULES = [
  {
    icon: ShoppingCart,
    title: 'Caja',
    path: '/dashboard/pos',
    color: '#3b82f6',
    description: 'Registra los ingresos y salidas diarias de tu sucursal. Aquí puedes cobrar arriendos, clases, cafetería, y tienda. Es el corazón operativo diario.'
  },
  {
    icon: Package,
    title: 'Inventario Logístico',
    path: '/dashboard/inventory',
    color: '#8b5cf6',
    description: 'Controla el stock de Tablas y Trajes de surf. También permite revisar y forzar estados de deterioro (AV1, AV2, AV3) en caso de accidentes.'
  },
  {
    icon: Users,
    title: 'Clientes y Deudas',
    path: '/dashboard/clients',
    color: '#06b6d4',
    description: 'Administra la base de datos de clientes, revisa el historial de transacciones de cada uno y cobra deudas pendientes ("fiado").'
  },
  {
    icon: CalendarDays,
    title: 'Suscripciones',
    path: '/dashboard/suscripciones',
    color: '#ec4899',
    description: 'Control de mensualidades, membresías y cupos de bodega. Monitorea vencimientos y renovaciones activas.'
  },
  {
    icon: ClipboardList,
    title: 'Cotizaciones',
    path: '/dashboard/cotizaciones',
    color: '#38bdf8',
    description: 'Gestiona las solicitudes de eventos y paseos de curso. Revisa los detalles de cada pedido y marca su estado de avance.'
  },
  {
    icon: FileText,
    title: 'Cierre de Caja',
    path: '/dashboard/closing',
    color: '#f59e0b',
    description: 'Genera el informe final del día resumido. Exporta o descarga en archivo .txt los detalles de ingresos físicos vs deudas de cada cajero.'
  },
  {
    icon: Briefcase,
    title: 'Personal',
    path: '/dashboard/staff',
    color: '#10b981',
    description: 'Gestiona la información de profesores, asistentes y cajeros. Asigna turnos, permisos y mantén el registro de sus contactos.'
  },
  {
    icon: BarChart3,
    title: 'Finanzas Globales',
    path: '/dashboard/finanzas',
    color: '#8b5cf6',
    description: 'Reportes y estadísticas globales. Solo accesible por superadministradores para ver y analizar el crecimiento económico mensual/anual.'
  },
  {
    icon: ListOrdered,
    title: 'Reg. Movimientos',
    path: '/dashboard/movimientos',
    color: '#64748b',
    description: 'Bitácora exhaustiva que registra todas y cada una de las transferencias, efectivas y fallidas, indicando responsables.'
  },
  {
    icon: Globe,
    title: 'Ventas Online',
    path: '/dashboard/ventas-online',
    color: '#6366f1',
    description: 'Registra y monitorea las compras, reservas de clases o arriendos que suceden a través del sitio web oficial.'
  },
  {
    icon: Store,
    title: 'Ventas Físicas',
    path: '/dashboard/ventas-fisicas',
    color: '#0284c7',
    description: 'Sección equivalente a Ventas Online pero exclusiva para el seguimiento granular avanzado de todo lo que ocurre físicamente.'
  },
  {
    icon: TrendingUp,
    title: 'Fondos',
    path: '/dashboard/fondos',
    color: '#f43f5e',
    description: 'Control de la caja chica o fondos de la empresa asignados por sucursal, útil para llevar control de gastos recurrentes internos.'
  },
];

export default function MenuPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '40px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
          <LifeBuoy size={32} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            MENÚ PRINCIPAL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
            Bienvenido al sistema ERP Wave Surf Club. Selecciona un módulo para comenzar a trabajar.
          </p>
        </div>
      </header>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {MODULES.map((mod, i) => (
          <div 
            key={i} 
            onClick={() => router.push(mod.path)}
            style={{ 
              background: '#fff', 
              borderRadius: 'var(--radius-xl)', 
              border: '1.5px solid var(--border-subtle)', 
              padding: '24px', 
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = mod.color;
              e.currentTarget.style.boxShadow = `0 10px 20px -5px ${mod.color}30`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                background: `${mod.color}15`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <mod.icon size={24} color={mod.color} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {mod.title}
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              {mod.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px', padding: '32px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed var(--border-subtle)', textAlign: 'center' }}>
        <Info size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', margin: '0 0 8px 0' }}>Centro de Soporte</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Si experimentas problemas técnicos, contacta con el administrador del sistema.
        </p>
        
        {/* Contact Info */}
        <div style={{ display: 'inline-block', textAlign: 'left', background: '#fff', padding: '16px 32px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>🧑‍💻 Creador:</span> Matias Patricio Espinoza Guerrero
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>📱 Fono:</span> +56 9 2964 5522
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 800 }}>📧 Correo:</span> mpeg.logistica@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}
