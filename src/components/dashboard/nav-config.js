// =============================================
// Dashboard navigation config (single source of truth)
// =============================================
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, Briefcase,
  BarChart3, ListOrdered, Globe, Store, CalendarDays, ClipboardList, Truck,
  Tags, CalendarCheck, Receipt, Repeat, Boxes,
} from 'lucide-react';

export const NAV_SECTIONS = [
  {
    id: 'general',
    label: 'General',
    items: [
      { path: '/dashboard', label: 'Panel principal', icon: LayoutDashboard, roles: ['superadmin', 'caja'], subtitle: 'Métricas operacionales, inventario y ventas en tiempo real', keywords: 'inicio menu home resumen', layoutHeader: true },
    ],
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    items: [
      { path: '/dashboard/pos', label: 'Caja', icon: ShoppingCart, roles: ['superadmin', 'caja', 'asistente'], subtitle: 'Punto de cobro, arriendos y caja de sucursal', keywords: 'pos cobro venta arriendo', layoutHeader: true },
      { path: '/dashboard/closing', label: 'Cierre de caja', icon: FileText, roles: ['superadmin', 'caja'], subtitle: 'Auditoría de caja, balances diarios y consolidación', keywords: 'cierre arqueo balance' },
      { path: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: ClipboardList, roles: ['superadmin', 'caja'], subtitle: 'Presupuestos y propuestas comerciales', keywords: 'presupuesto cotizar' },
    ],
  },
  {
    id: 'logistica',
    label: 'Logística',
    items: [
      { path: '/dashboard/inventory', label: 'Inventario', icon: Boxes, roles: ['superadmin', 'caja'], subtitle: 'Control logístico, salud de equipos y rotación', keywords: 'stock tablas trajes equipos' },
      { path: '/dashboard/agenda-ventas', label: 'Agenda de clases', icon: CalendarDays, roles: ['superadmin', 'caja'], subtitle: 'Programación de clases y profesores', keywords: 'clases calendario agenda' },
      { path: '/dashboard/inventory/pedidos', label: 'Pedidos online', icon: Truck, roles: ['superadmin', 'caja'], subtitle: 'Despacho y preparación de pedidos web', keywords: 'despacho envio pedido' },
    ],
  },
  {
    id: 'tienda',
    label: 'Tienda online',
    items: [
      { path: '/dashboard/tienda', label: 'Productos', icon: Package, roles: ['superadmin', 'caja'], subtitle: 'Catálogo de productos de la tienda online', keywords: 'catalogo producto ecommerce' },
      { path: '/dashboard/tienda/categorias', label: 'Categorías', icon: Tags, roles: ['superadmin', 'caja'], subtitle: 'Organización del catálogo por categorías', keywords: 'categoria' },
      { path: '/dashboard/tienda/reservas', label: 'Reservas', icon: CalendarCheck, roles: ['superadmin', 'caja'], subtitle: 'Reservas de servicios realizadas en la web', keywords: 'reserva booking' },
      { path: '/dashboard/tienda/ordenes', label: 'Órdenes', icon: Receipt, roles: ['superadmin', 'caja'], subtitle: 'Órdenes de compra y estado de pago', keywords: 'orden compra flow' },
    ],
  },
  {
    id: 'crm',
    label: 'Clientes',
    items: [
      { path: '/dashboard/clients', label: 'Clientes y deudas', icon: Users, roles: ['superadmin', 'caja'], subtitle: 'CRM, historial de visitas y balance de deudas', keywords: 'cliente crm deuda fiado' },
      { path: '/dashboard/suscripciones', label: 'Suscripciones', icon: Repeat, roles: ['superadmin', 'caja'], subtitle: 'Mensualidades, bodegas y planes recurrentes', keywords: 'mensualidad plan bodega' },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    items: [
      { path: '/dashboard/finanzas', label: 'Finanzas globales', icon: BarChart3, roles: ['superadmin'], subtitle: 'Reportes ejecutivos de ingresos, egresos y rentabilidad', keywords: 'reporte ingresos egresos' },
      { path: '/dashboard/movimientos', label: 'Movimientos', icon: ListOrdered, roles: ['superadmin'], subtitle: 'Registro histórico de todas las transacciones', keywords: 'transacciones historial log' },
      { path: '/dashboard/ventas-fisicas', label: 'Ventas físicas', icon: Store, roles: ['superadmin', 'caja'], subtitle: 'Ventas realizadas en sucursal', keywords: 'ventas local sucursal' },
      { path: '/dashboard/ventas-online', label: 'Ventas online', icon: Globe, roles: ['superadmin'], subtitle: 'Ventas realizadas a través de la web', keywords: 'web ecommerce ventas' },
      { path: '/dashboard/staff', label: 'Personal', icon: Briefcase, roles: ['superadmin'], subtitle: 'Equipo, roles y accesos del personal', keywords: 'staff equipo usuarios empleados' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      { path: '/dashboard/settings', label: 'Configuración', icon: Settings, roles: ['superadmin'], subtitle: 'Preferencias del sistema, sedes e integraciones', keywords: 'ajustes settings preferencias' },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items.map(i => ({ ...i, section: s.label, sectionId: s.id })));

/** Longest-prefix match so nested routes highlight the right item. */
export function matchNavItem(pathname) {
  if (!pathname) return null;
  let best = null;
  for (const item of ALL_NAV_ITEMS) {
    const exact = pathname === item.path;
    const nested = item.path !== '/dashboard' && pathname.startsWith(item.path + '/');
    if ((exact || nested) && (!best || item.path.length > best.path.length)) best = item;
  }
  return best;
}

export function sectionsForRole(role) {
  return NAV_SECTIONS
    .map(s => ({ ...s, items: s.items.filter(i => i.roles.includes(role)) }))
    .filter(s => s.items.length > 0);
}
