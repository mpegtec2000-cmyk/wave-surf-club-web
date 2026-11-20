// =============================================
// WAVE SURF CLUB — Constants & Enums
// =============================================

export const BRANCHES = [
  { id: 1, name: 'WAVE SURF PUNTA PIEDRA', shortName: 'Punta Piedra', icon: 'Palmtree', emoji: '' },
  { id: 2, name: 'WAVE SURF CONCÓN', shortName: 'Concón', icon: 'Waves', emoji: '' },
  { id: 3, name: 'WAVE SURF PICHILEMU', shortName: 'Pichilemu', icon: 'Compass', emoji: '' },
];

export const ROLES = {
  SUPERADMIN: 'superadmin',
  CAJA: 'caja',
  ASISTENTE: 'asistente',
  CLIENTE: 'cliente',
  PROFESOR: 'profesor',
  RIDER: 'rider',
};

export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  caja: 'Caja',
  asistente: 'Asistente',
  cliente: 'Cliente',
  profesor: 'Profesor',
  rider: 'Rider',
};

export const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo', icon: 'Banknote' },
  { value: 'transferencia', label: 'Transferencia', icon: 'Building2' },
  { value: 'tarjeta', label: 'Tarjeta Crédito/Débito', icon: 'CreditCard' },
  { value: 'debito', label: 'Débito Online', icon: 'Wallet' },
  { value: 'por_pagar', label: 'Dejar por Pagar (Fiado)', icon: 'FileText' },
];

export const TRANSACTION_CATEGORIES = [
  { value: 'arriendo', label: 'Arriendo', icon: 'Waves' },
  { value: 'clase', label: 'Clase', icon: 'GraduationCap' },
  { value: 'tienda', label: 'Tienda', icon: 'ShoppingBag' },
  { value: 'cafeteria', label: 'Cafetería', icon: 'Coffee' },
  { value: 'mensualidad', label: 'Mensualidad', icon: 'CalendarDays' },
  { value: 'bodega', label: 'Bodega', icon: 'Briefcase' },
  { value: 'pago_deuda', label: 'Pago de Deuda', icon: 'CheckCircle2' },
  { value: 'otro', label: 'Otro', icon: 'Package' },
];

export const TRANSACTION_TYPES = [
  { value: 'ingreso', label: 'Ingreso', color: '#10b981' },
  { value: 'salida', label: 'Salida', color: '#ef4444' },
];

export const AV_LEVELS = {
  AV1: { level: 'AV1', label: 'ÓPTIMO', iconName: 'CheckCircle2', icon: '', cssClass: 'av-optimal' },
  AV2: { level: 'AV2', label: 'REVISIÓN', iconName: 'Clock', icon: '', cssClass: 'av-review' },
  AV3: { level: 'AV3', label: 'REPARACIÓN', iconName: 'Wrench', icon: '', cssClass: 'av-repair' },
  URGENTE: { level: 'URGENTE', label: 'VENCIDO', iconName: 'AlertTriangle', icon: '', cssClass: 'av-urgent' },
};

export const LANGUAGES = [
  { code: 'es', name: 'Español', badge: 'ES', flag: '' },
  { code: 'en', name: 'English', badge: 'EN', flag: '' },
  { code: 'pt', name: 'Português', badge: 'PT', flag: '' },
  { code: 'fr', name: 'Français', badge: 'FR', flag: '' },
  { code: 'de', name: 'Deutsch', badge: 'DE', flag: '' },
  { code: 'zh', name: '中文', badge: 'ZH', flag: '' },
  { code: 'ar', name: 'العربية', badge: 'AR', flag: '' },
  { code: 'ru', name: 'Русский', badge: 'RU', flag: '' },
  { code: 'ja', name: '日本語', badge: 'JA', flag: '' },
  { code: 'ko', name: '한국어', badge: 'KO', flag: '' },
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'MENÚ', icon: 'LayoutDashboard', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/pos', label: 'Caja', icon: 'ShoppingCart', roles: ['superadmin', 'caja', 'asistente'] },
  { path: '/dashboard/inventory', label: 'Inventario', icon: 'Package', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/clients', label: 'Clientes', icon: 'Users', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/staff', label: 'Personal', icon: 'Briefcase', roles: ['superadmin'] },
  { path: '/dashboard/closing', label: 'Cierre de Caja', icon: 'FileText', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/finanzas', label: 'Finanzas Globales', icon: 'BarChart3', roles: ['superadmin'] },
  { path: '/dashboard/movimientos', label: 'Reg. Movimientos', icon: 'ListOrdered', roles: ['superadmin'] },
  { path: '/dashboard/ventas-online', label: 'Ventas Online', icon: 'Globe', roles: ['superadmin'] },
  { path: '/dashboard/agenda-ventas', label: 'Agenda Clases', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/inventory/pedidos', label: 'Pedidos Tienda Online', icon: 'Truck', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/ventas-fisicas', label: 'Ventas Físicas', icon: 'Store', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/suscripciones', label: 'Suscripciones', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: 'ClipboardList', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda', label: 'Productos Tienda', icon: 'Package', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/categorias', label: 'Categorías Tienda', icon: 'ListOrdered', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/reservas', label: 'Reservas Tienda', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/ordenes', label: 'Órdenes Tienda', icon: 'ShoppingCart', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/settings', label: 'Configuración', icon: 'Settings', roles: ['superadmin'] },
];
