'use client';

import { LifeBuoy, Info, ShoppingCart, Package, Users, Briefcase, FileText, BarChart3, ListOrdered, Globe, Store, TrendingUp, Settings } from 'lucide-react';

const MODULES = [
  {
    icon: ShoppingCart,
    title: 'Caja',
    color: '#3b82f6',
    description: 'Registra los ingresos y salidas diarias de tu sucursal. Aquí puedes cobrar arriendos, clases, cafetería, y tienda. Es el corazón operativo diario.'
  },
  {
    icon: Package,
    title: 'Inventario Logístico',
    color: '#8b5cf6',
    description: 'Controla el stock de Tablas y Trajes de surf. También permite revisar y forzar estados de deterioro (AV1, AV2, AV3) en caso de accidentes.'
  },
  {
    icon: Users,
    title: 'Clientes y Deudas',
    color: '#06b6d4',
    description: 'Administra la base de datos de clientes, revisa el historial de transacciones de cada uno y cobra deudas pendientes ("fiado").'
  },
  {
    icon: Briefcase,
    title: 'Personal',
    color: '#10b981',
    description: 'Gestiona la información de profesores, asistentes y cajeros. Asigna turnos, permisos y mantén el registro de sus contactos.'
  },
  {
    icon: FileText,
    title: 'Cierre de Caja',
    color: '#f59e0b',
    description: 'Genera el informe final del día resumido. Exporta o descarga en archivo .txt los detalles de ingresos físicos vs deudas de cada cajero.'
  },
  {
    icon: BarChart3,
    title: 'Finanzas Globales',
    color: '#ec4899',
    description: 'Reportes y estadísticas globales. Solo accesible por superadministradores para ver y analizar el crecimiento económico mensual/anual de la compañía.'
  },
  {
    icon: ListOrdered,
    title: 'Reg. Movimientos',
    color: '#64748b',
    description: 'Bitácora exhaustiva que registra todas y cada una de las transferencias, efectivas y fallidas, indicando responsables y detalles a fondo.'
  },
  {
    icon: Globe,
    title: 'Ventas Online',
    color: '#6366f1',
    description: 'Registra y monitorea las compras, reservas de clases o arriendos que suceden a través del sitio web oficial sin intervención manual de la caja.'
  },
  {
    icon: Store,
    title: 'Ventas Físicas',
    color: '#0284c7',
    description: 'Sección equivalente a Ventas Online pero exclusiva para el seguimiento granular avanzado de todo lo que ocurre físicamente en las sedes.'
  },
  {
    icon: TrendingUp,
    title: 'Fondos',
    color: '#f43f5e',
    description: 'Control de la caja chica o fondos de la empresa asignados por sucursal, útil para llevar control de gastos recurrentes internos.'
  },
];

export default function SupportPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '40px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
          <LifeBuoy size={32} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            CENTRO DE SOPORTE
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
            Guía de uso oficial del ERP Wave Surf Club. Revisa para qué sirve cada módulo.
          </p>
        </div>
      </header>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {MODULES.map((mod, i) => (
          <div key={i} style={{ 
            background: '#fff', 
            borderRadius: 'var(--radius-xl)', 
            border: '1.5px solid var(--border-subtle)', 
            padding: '24px', 
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.2s',
            cursor: 'default'
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
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', margin: '0 0 8px 0' }}>¿Problemas Técnicos?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
          Si experimentas problemas críticos con el sistema que no se resuelvan leyendo las instrucciones de uso, por favor ponte en contacto con los administradores del sistema o superusuarios encargados de la infraestructura.
        </p>
      </div>
    </div>
  );
}
