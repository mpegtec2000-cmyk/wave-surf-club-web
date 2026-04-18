// =============================================
// WAVE SURF CLUB — Constants & Enums
// =============================================

export const BRANCHES = [
  { id: 1, name: 'WAVE SURF PUNTA PIEDRA', shortName: 'Punta Piedra', emoji: '🏖️' },
  { id: 2, name: 'WAVE SURF CONCÓN', shortName: 'Concón', emoji: '🌊' },
  { id: 3, name: 'WAVE SURF PICHILEMU', shortName: 'Pichilemu', emoji: '🏄' },
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
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'debito', label: 'Débito Online', icon: '🏧' },
  { value: 'por_pagar', label: 'Dejar por Pagar (Fiado)', icon: '📋' },
];

export const TRANSACTION_CATEGORIES = [
  { value: 'arriendo', label: 'Arriendo', icon: '🏄' },
  { value: 'clase', label: 'Clase', icon: '📚' },
  { value: 'tienda', label: 'Tienda', icon: '🛍️' },
  { value: 'cafeteria', label: 'Cafetería', icon: '☕' },
  { value: 'mensualidad', label: 'Mensualidad', icon: '🗓️' },
  { value: 'bodega', label: 'Bodega', icon: '🧳' },
  { value: 'pago_deuda', label: 'Pago de Deuda', icon: '✅' },
  { value: 'otro', label: 'Otro', icon: '📦' },
];

export const TRANSACTION_TYPES = [
  { value: 'ingreso', label: 'Ingreso', color: '#22c55e' },
  { value: 'salida', label: 'Salida', color: '#ef4444' },
];

export const AV_LEVELS = {
  AV1: { level: 'AV1', label: 'ÓPTIMO', icon: '✅', cssClass: 'av-optimal' },
  AV2: { level: 'AV2', label: 'REVISIÓN', icon: '🕒', cssClass: 'av-review' },
  AV3: { level: 'AV3', label: 'REPARACIÓN', icon: '🔧', cssClass: 'av-repair' },
  URGENTE: { level: 'URGENTE', label: 'VENCIDO', icon: '⚠️', cssClass: 'av-urgent' },
};

export const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'MENÚ', icon: 'LifeBuoy', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/pos', label: 'Caja', icon: 'ShoppingCart', roles: ['superadmin', 'caja', 'asistente'] },
  { path: '/dashboard/inventory', label: 'Inventario', icon: 'Package', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/clients', label: 'Clientes', icon: 'Users', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/staff', label: 'Personal', icon: 'Briefcase', roles: ['superadmin'] },
  { path: '/dashboard/closing', label: 'Cierre de Caja', icon: 'FileText', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/finanzas', label: 'Finanzas Globales', icon: 'BarChart3', roles: ['superadmin'] },
  { path: '/dashboard/movimientos', label: 'Reg. Movimientos', icon: 'ListOrdered', roles: ['superadmin'] },
  { path: '/dashboard/ventas-online', label: 'Ventas Online', icon: 'Globe', roles: ['superadmin'] },
  { path: '/dashboard/agenda-ventas', label: 'Agenda de Clases y Arriendos', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/ventas-fisicas', label: 'Ventas Físicas', icon: 'Store', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/suscripciones', label: 'Suscripciones', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: 'ClipboardList', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda', label: 'Productos Tienda', icon: 'Package', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/categorias', label: 'Categorías Tienda', icon: 'ListOrdered', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/reservas', label: 'Reservas Tienda', icon: 'CalendarDays', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/tienda/ordenes', label: 'Órdenes Tienda', icon: 'ShoppingCart', roles: ['superadmin', 'caja'] },
  { path: '/dashboard/settings', label: 'Configuración', icon: 'Settings', roles: ['superadmin'] },
  { path: '/dashboard/antigravity', label: 'Antigravity AI', icon: 'Briefcase', roles: ['superadmin'] },
];
