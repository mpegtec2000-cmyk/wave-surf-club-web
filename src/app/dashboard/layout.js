'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { BRANCHES, LANGUAGES, ROLE_LABELS } from '@/lib/constants';
import { BranchContext } from '@/lib/branch-context';
import { useTranslation } from '@/lib/i18n-context';
import { sectionsForRole, matchNavItem } from '@/components/dashboard/nav-config';
import CommandPalette from '@/components/dashboard/CommandPalette';
import {
  Search, Bell, ChevronDown, ChevronRight, ChevronsUpDown, Check, LogOut, Settings,
  Menu, X, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, MapPin, CheckCircle2,
  Wifi, WifiOff, Clock, Home,
} from 'lucide-react';

const LS = {
  collapsed: 'wsc.sidebar.collapsed',
  sections: 'wsc.sidebar.closedSections',
  branch: 'wsc.branch',
};

const readLS = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
};
const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOutside, active]);
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang, changeLang } = useTranslation();

  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [closedSections, setClosedSections] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState(null); // 'branch' | 'notif' | 'user' | null
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(null);
  const [online, setOnline] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollRef = useRef(null);
  const branchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const closeMenu = useCallback(() => setMenu(null), []);
  useClickOutside(branchRef, closeMenu, menu === 'branch');
  useClickOutside(notifRef, closeMenu, menu === 'notif');
  useClickOutside(userRef, closeMenu, menu === 'user');

  // ── Auth + persisted preferences ──
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
    const allowed = u.allowed_branches?.length ? u.allowed_branches : BRANCHES.map(b => b.id);
    const saved = readLS(LS.branch, null);
    setSelectedBranch(allowed.includes(saved) ? saved : allowed[0]);
    setCollapsed(readLS(LS.collapsed, false));
    setClosedSections(readLS(LS.sections, []));
  }, [router]);

  useEffect(() => { if (user) writeLS(LS.branch, selectedBranch); }, [selectedBranch, user]);

  // ── Route change: close overlays, reset scroll ──
  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
    setPaletteOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // ── Clock / connectivity / fullscreen ──
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(c => { writeLS(LS.collapsed, !c); return !c; });
  }, []);

  // ── Notifications (Supabase realtime, fail-safe) ──
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ordenes_tienda')
        .select('id, nombre_cliente, total, created_at, estado')
        .neq('estado', 'revisado')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error) setNotifications(data || []);
    } catch { setNotifications([]); }
  }, []);

  const markReviewed = async (id) => {
    setNotifications(n => n.filter(x => x.id !== id));
    try { await supabase.from('ordenes_tienda').update({ estado: 'revisado' }).eq('id', id); } catch {}
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    let channel;
    try {
      channel = supabase
        .channel('dashboard-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes_tienda' }, fetchNotifications)
        .subscribe();
    } catch {}
    return () => { try { channel && supabase.removeChannel(channel); } catch {} };
  }, [user, fetchNotifications]);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); return; }
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); toggleCollapsed(); return; }
      if (e.key === 'Escape') { setMenu(null); setMobileOpen(false); return; }
      if (!typing && e.key === '/') { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  const handleLogout = useCallback(async () => { await logoutUser(); router.replace('/login'); }, [router]);

  // ── Derived data ──
  const sections = useMemo(() => (user ? sectionsForRole(user.role) : []), [user]);
  const current = matchNavItem(pathname);
  const allowedBranches = useMemo(() => {
    if (!user) return BRANCHES;
    const ids = user.allowed_branches?.length ? user.allowed_branches : BRANCHES.map(b => b.id);
    return BRANCHES.filter(b => ids.includes(b.id));
  }, [user]);
  const currentBranch = BRANCHES.find(b => b.id === selectedBranch) || BRANCHES[0];

  const labelOf = useCallback((item) => {
    if (lang === 'es') return item.label;
    const key = item.path.split('/').pop() || 'dashboard';
    const tr = t(`nav.${key}`);
    return tr && !tr.startsWith('nav.') ? tr : item.label;
  }, [lang, t]);

  const paletteItems = useMemo(() => {
    const nav = sections.flatMap(s => s.items.map(it => ({
      id: it.path, label: labelOf(it), hint: it.subtitle, group: s.label, icon: it.icon, keywords: it.keywords,
      run: () => router.push(it.path),
    })));
    const branches = allowedBranches.map(b => ({
      id: `branch-${b.id}`, label: `Cambiar a ${b.shortName}`, hint: b.name, group: 'Sedes', icon: MapPin, keywords: 'sede sucursal branch',
      run: () => setSelectedBranch(b.id),
    }));
    const actions = [
      { id: 'act-sidebar', label: collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral', hint: 'Ctrl + B', group: 'Acciones', icon: collapsed ? PanelLeftOpen : PanelLeftClose, run: toggleCollapsed },
      { id: 'act-fs', label: isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa', group: 'Acciones', icon: isFullscreen ? Minimize2 : Maximize2, run: toggleFullscreen },
      { id: 'act-home', label: 'Ir al sitio web', hint: 'wavesurfclub', group: 'Acciones', icon: Home, run: () => router.push('/') },
      { id: 'act-logout', label: 'Cerrar sesión', group: 'Acciones', icon: LogOut, run: handleLogout },
    ];
    return [...nav, ...branches, ...actions];
  }, [sections, allowedBranches, collapsed, isFullscreen, labelOf, router, toggleCollapsed, toggleFullscreen, handleLogout]);

  const toggleSection = (id) => {
    setClosedSections(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeLS(LS.sections, next);
      return next;
    });
  };

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f4f4f5]">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  const timeLabel = now ? now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const dateLabel = now ? now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const isCollapsed = collapsed && !mobileOpen;
  const initial = (user.name || user.email || 'W').charAt(0).toUpperCase();

  return (
    <BranchContext.Provider value={{ activeBranchId: selectedBranch, setActiveBranchId: setSelectedBranch }}>
      <div className="vc-admin wsc-shell h-screen w-full flex overflow-hidden bg-[#f4f4f5] text-neutral-900 antialiased">

        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside
          className={`wsc-sidebar fixed lg:relative inset-y-0 left-0 z-50 flex flex-col shrink-0 bg-[#f4f4f5] transition-[width,transform] duration-200 ease-out
            ${mobileOpen ? 'translate-x-0 shadow-2xl bg-white' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-[72px]' : 'w-[264px]'}`}
          aria-label="Navegación principal"
        >
          {/* Brand */}
          <div className={`h-16 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between pl-4 pr-3'}`}>
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" title="Wave Surf Club">
              <span className="w-9 h-9 rounded-xl bg-black overflow-hidden shrink-0 ring-1 ring-black/10">
                <img src="/images/wsc-logo-symbol.jpg" alt="" className="w-full h-full object-cover" />
              </span>
              {!isCollapsed && (
                <span className="min-w-0 leading-tight">
                  <span className="block text-[13.5px] font-semibold tracking-tight truncate">Wave Surf Club</span>
                  <span className="block text-[11px] text-neutral-500 truncate">ERP &amp; Punto de venta</span>
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button type="button" onClick={mobileOpen ? () => setMobileOpen(false) : toggleCollapsed} className="wsc-icon-btn" title={mobileOpen ? 'Cerrar menú' : 'Contraer (Ctrl + B)'} aria-label="Contraer barra lateral">
                {mobileOpen ? <X size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
          </div>

          {/* Search + branch */}
          <div className={`shrink-0 space-y-2 ${isCollapsed ? 'px-3' : 'px-3'}`}>
            {isCollapsed ? (
              <button type="button" onClick={toggleCollapsed} className="wsc-rail-btn" title="Expandir (Ctrl + B)" aria-label="Expandir barra lateral">
                <PanelLeftOpen size={17} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className={isCollapsed ? 'wsc-rail-btn' : 'w-full h-9 flex items-center gap-2 px-3 rounded-xl bg-white border border-neutral-200 text-[13px] text-neutral-500 hover:border-neutral-300 transition-colors'}
              title="Buscar (Ctrl + K)"
            >
              <Search size={15} className="shrink-0" />
              {!isCollapsed && (<><span className="flex-1 text-left">Buscar...</span><kbd className="wsc-kbd">Ctrl K</kbd></>)}
            </button>

            {/* Branch switcher */}
            <div className="relative" ref={branchRef}>
              <button
                type="button"
                onClick={() => setMenu(m => (m === 'branch' ? null : 'branch'))}
                className={isCollapsed ? 'wsc-rail-btn' : 'w-full h-10 flex items-center gap-2.5 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-colors'}
                title={`Sede: ${currentBranch.shortName}`}
                aria-haspopup="listbox"
                aria-expanded={menu === 'branch'}
              >
                <MapPin size={15} className="shrink-0 text-neutral-500" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 min-w-0 text-left leading-tight">
                      <span className="block text-[10.5px] text-neutral-400">Sede activa</span>
                      <span className="block text-[13px] font-medium truncate">{currentBranch.shortName}</span>
                    </span>
                    <ChevronsUpDown size={14} className="text-neutral-400 shrink-0" />
                  </>
                )}
              </button>
              {menu === 'branch' && (
                <div className={`absolute z-50 mt-1.5 w-56 bg-white rounded-xl border border-neutral-200 shadow-xl p-1.5 wsc-pop ${isCollapsed ? 'left-full top-0 ml-2 mt-0' : 'left-0'}`} role="listbox">
                  <div className="px-2 py-1.5 text-[11px] font-medium text-neutral-400">Centros de costo</div>
                  {allowedBranches.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      role="option"
                      aria-selected={b.id === selectedBranch}
                      onClick={() => { setSelectedBranch(b.id); setMenu(null); }}
                      className="w-full flex items-center justify-between gap-2 px-2 h-9 rounded-lg text-[13px] text-left hover:bg-neutral-100"
                    >
                      <span className="truncate">{b.shortName}</span>
                      {b.id === selectedBranch && <Check size={14} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden wsc-scroll px-3 pt-4 pb-3">
            {sections.map((section, si) => {
              const closed = closedSections.includes(section.id) && !isCollapsed;
              const hasActive = section.items.some(i => current?.path === i.path);
              return (
                <div key={section.id} className={si > 0 ? 'mt-3' : ''}>
                  {isCollapsed ? (
                    si > 0 && <div className="mx-3 mb-3 h-px bg-neutral-200" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-2.5 h-7 text-[11.5px] font-medium text-neutral-400 hover:text-neutral-700 rounded-md"
                      aria-expanded={!closed}
                    >
                      <span className="flex items-center gap-1.5">
                        {section.label}
                        {closed && hasActive && <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />}
                      </span>
                      <ChevronDown size={13} className={`transition-transform ${closed ? '-rotate-90' : ''}`} />
                    </button>
                  )}
                  {!closed && (
                    <ul className="space-y-0.5 mt-0.5">
                      {section.items.map(item => {
                        const Icon = item.icon;
                        const active = current?.path === item.path;
                        const label = labelOf(item);
                        return (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              aria-current={active ? 'page' : undefined}
                              title={isCollapsed ? label : undefined}
                              className={`wsc-nav-link group ${active ? 'is-active' : ''} ${isCollapsed ? 'justify-center px-0' : 'px-2.5'}`}
                            >
                              <Icon size={17} className="shrink-0 wsc-nav-icon" strokeWidth={active ? 2.2 : 1.8} />
                              {!isCollapsed && <span className="truncate">{label}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User card */}
          <div className="shrink-0 p-3 border-t border-neutral-200/70">
            <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
              <span className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-[13px] font-semibold shrink-0" title={user.email}>{initial}</span>
              {!isCollapsed && (
                <>
                  <span className="flex-1 min-w-0 leading-tight">
                    <span className="block text-[13px] font-medium truncate capitalize">{user.name || user.email?.split('@')[0]}</span>
                    <span className="block text-[11px] text-neutral-500 truncate">{ROLE_LABELS[user.role] || user.role}</span>
                  </span>
                  <button type="button" onClick={handleLogout} className="wsc-icon-btn hover:!text-red-600" title="Cerrar sesión" aria-label="Cerrar sesión">
                    <LogOut size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-[1px]" onClick={() => setMobileOpen(false)} />}

        {/* ═══════════ MAIN PANEL ═══════════ */}
        <main className="flex-1 min-w-0 flex flex-col lg:my-2 lg:mr-2 bg-white lg:rounded-2xl lg:border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">

          {/* Top bar */}
          <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 border-b border-neutral-100">
            <div className="flex items-center gap-2 min-w-0">
              <button type="button" className="wsc-icon-btn lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
                <Menu size={18} />
              </button>
              <nav aria-label="Ruta" className="flex items-center gap-1.5 text-[13px] min-w-0">
                <Link href="/dashboard" className="!text-neutral-400 hover:!text-neutral-900 transition-colors hidden sm:inline">Inicio</Link>
                {current && current.path !== '/dashboard' && (
                  <>
                    <ChevronRight size={13} className="text-neutral-300 hidden sm:block" />
                    <span className="text-neutral-400 hidden sm:inline">{current.section}</span>
                    <ChevronRight size={13} className="text-neutral-300 hidden sm:block" />
                  </>
                )}
                {current && current.path === '/dashboard' && <ChevronRight size={13} className="text-neutral-300 hidden sm:block" />}
                <span className="font-medium text-neutral-900 truncate">{current ? labelOf(current) : 'Panel'}</span>
              </nav>
            </div>

            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setPaletteOpen(true)} className="wsc-icon-btn md:hidden" aria-label="Buscar"><Search size={17} /></button>

              <span className={`hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium border ${online ? 'text-neutral-700 border-neutral-200' : 'text-red-700 border-red-200 bg-red-50'}`} title={online ? 'Conectado' : 'Sin conexión'}>
                {online ? <Wifi size={13} className="text-emerald-600" /> : <WifiOff size={13} />}
                {online ? 'En línea' : 'Sin conexión'}
              </span>

              <span className="hidden xl:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] text-neutral-600 border border-neutral-200 tabular-nums" suppressHydrationWarning>
                <Clock size={13} className="text-neutral-400" />
                <span className="capitalize">{dateLabel}</span>
                <span className="text-neutral-300">·</span>
                {timeLabel}
              </span>

              <div className="hidden sm:flex items-center h-8 p-0.5 rounded-lg border border-neutral-200 bg-neutral-50">
                {LANGUAGES.slice(0, 3).map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => changeLang(l.code)}
                    className={`h-full px-2 rounded-md text-[11px] font-semibold transition-colors ${lang === l.code ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    aria-pressed={lang === l.code}
                  >
                    {l.badge}
                  </button>
                ))}
              </div>

              <button type="button" onClick={toggleFullscreen} className="wsc-icon-btn hidden sm:inline-flex" title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} aria-label="Pantalla completa">
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button type="button" onClick={() => setMenu(m => (m === 'notif' ? null : 'notif'))} className="wsc-icon-btn relative" title="Notificaciones" aria-label="Notificaciones" aria-expanded={menu === 'notif'}>
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                {menu === 'notif' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-xl z-50 wsc-pop overflow-hidden">
                    <div className="flex items-center justify-between px-4 h-11 border-b border-neutral-100">
                      <span className="text-[13px] font-semibold">Órdenes pendientes</span>
                      <span className="text-[11px] text-neutral-500">{notifications.length} nuevas</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <CheckCircle2 size={22} className="mx-auto text-neutral-300" />
                          <p className="text-[12.5px] text-neutral-500 mt-2">Todo al día</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium truncate">{n.nombre_cliente || 'Cliente web'}</div>
                            <div className="text-[11.5px] text-neutral-500 tabular-nums">${Number(n.total || 0).toLocaleString('es-CL')}</div>
                          </div>
                          <button type="button" onClick={() => markReviewed(n.id)} className="h-7 px-2.5 rounded-lg border border-neutral-200 text-[11.5px] font-medium hover:bg-white">Revisado</button>
                        </div>
                      ))}
                    </div>
                    <Link href="/dashboard/tienda/ordenes" className="block text-center h-10 leading-10 text-[12.5px] font-medium border-t border-neutral-100 hover:bg-neutral-50">Ver todas las órdenes</Link>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={userRef}>
                <button type="button" onClick={() => setMenu(m => (m === 'user' ? null : 'user'))} className="flex items-center gap-1.5 h-8 pl-0.5 pr-1.5 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Menú de usuario" aria-expanded={menu === 'user'}>
                  <span className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center text-[12px] font-semibold">{initial}</span>
                  <ChevronDown size={13} className="text-neutral-400" />
                </button>
                {menu === 'user' && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-neutral-200 shadow-xl z-50 p-1.5 wsc-pop">
                    <div className="px-2.5 py-2 border-b border-neutral-100 mb-1">
                      <div className="text-[13px] font-semibold truncate capitalize">{user.name || user.email?.split('@')[0]}</div>
                      <div className="text-[11.5px] text-neutral-500 truncate">{user.email}</div>
                    </div>
                    {user.role === 'superadmin' && (
                      <Link href="/dashboard/settings" className="flex items-center gap-2 px-2.5 h-9 rounded-lg text-[13px] hover:bg-neutral-100"><Settings size={15} /> Configuración</Link>
                    )}
                    <button type="button" onClick={() => setPaletteOpen(true)} className="w-full flex items-center gap-2 px-2.5 h-9 rounded-lg text-[13px] hover:bg-neutral-100"><Search size={15} /> Buscar <kbd className="wsc-kbd ml-auto">Ctrl K</kbd></button>
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 h-9 rounded-lg text-[13px] !text-red-600 hover:bg-red-50"><LogOut size={15} /> Cerrar sesión</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <div ref={scrollRef} id="wsc-content" className="flex-1 min-h-0 overflow-y-auto wsc-scroll bg-[#fafafa]">
            {/* Page header (only for modules without their own header) */}
            {(!current || current.layoutHeader) && (
              <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 leading-tight">
                    {current ? labelOf(current) : 'Panel'}
                  </h1>
                  <p className="text-[13.5px] text-neutral-500 mt-1">{current?.subtitle || 'Panel de gestión Wave Surf Club'}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-neutral-200 text-[12px] font-medium text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {currentBranch.shortName}
                </span>
              </div>
            )}

            <div key={pathname} className={`px-4 sm:px-6 lg:px-8 pb-10 wsc-fade-in ${(!current || current.layoutHeader) ? '' : 'pt-6'}`}>
              {children}
            </div>
          </div>
        </main>

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
      </div>
    </BranchContext.Provider>
  );
}
