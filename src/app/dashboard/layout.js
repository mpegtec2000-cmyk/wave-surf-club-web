'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { NAV_ITEMS, BRANCHES, LANGUAGES } from '@/lib/constants';
import { BranchContext } from '@/lib/branch-context';
import { useTranslation } from '@/lib/i18n-context';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  FileText, Settings, LogOut, Menu, X, Briefcase, ChevronRight, BarChart3, TrendingUp, TrendingDown,
  ListOrdered, Globe, Store, LifeBuoy, CalendarDays, ClipboardList, Bell, Search,
  Building2, ChevronDown, Activity, Zap, CheckCircle, Truck
} from 'lucide-react';

const iconMap = {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, Briefcase, BarChart3, TrendingUp, TrendingDown,
  ListOrdered, Globe, Store, LifeBuoy, CalendarDays, ClipboardList, Truck
};

// Group nav items by category for SAP-style grouping
const NAV_GROUPS = [
  { label: 'OPERACIONES', keys: ['pos', 'closing', 'cotizaciones'] },
  { label: 'LOGÍSTICA', keys: ['inventory', 'agenda-ventas', 'pedidos'] },
  { label: 'TIENDA', keys: ['tienda', 'categorias', 'reservas', 'ordenes'] },
  { label: 'CLIENTES', keys: ['clients', 'suscripciones'] },
  { label: 'VENTAS', keys: ['ventas-online', 'ventas-fisicas'] },
  { label: 'ADMINISTRACIÓN', keys: ['staff', 'finanzas', 'movimientos'] },
  { label: 'SISTEMA', keys: ['dashboard', 'settings', 'antigravity'] },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const { t, lang, changeLang } = useTranslation();
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
    setSelectedBranch(u.allowed_branches?.[0] || 1);
  }, [router]);

  // Notifications logic
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('ordenes_tienda')
      .select('id, nombre_cliente, total, created_at, estado')
      .neq('estado', 'revisado')
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  };

  const markNotifAsReviewed = async (id) => {
    await supabase.from('ordenes_tienda').update({ estado: 'revisado' }).eq('id', id);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('schema-db-changes-root')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ordenes_tienda' }, payload => {
        fetchNotifications();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ordenes_tienda' }, payload => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && !event.target.closest('.topbar-icon-btn')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleLogout = () => { logoutUser(); router.replace('/login'); };

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const currentBranch = BRANCHES.find(b => b.id === selectedBranch);

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(i => i.path === pathname);
    if (!item) return 'Dashboard';
    const key = item.path.split('/').pop() || 'dashboard';
    return t(`nav.${key}`);
  };

  const getNavGroups = () => {
    return NAV_GROUPS.map(group => {
      const items = filteredNav.filter(item => {
        const key = item.path.split('/').pop() || 'dashboard';
        return group.keys.includes(key);
      });
      return { ...group, items };
    }).filter(g => g.items.length > 0);
  };

  const searchResults = searchQuery.length > 1
    ? filteredNav.filter(item => {
        const key = item.path.split('/').pop() || 'dashboard';
        const label = t(`nav.${key}`).toLowerCase();
        return label.includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <BranchContext.Provider value={{ activeBranchId: selectedBranch, setActiveBranchId: setSelectedBranch }}>
    <div className="erp-shell">

      {/* ── TOPBAR ── */}
      <header className="erp-topbar">
        <div className="topbar-left-group">
          <button className="topbar-brand" onClick={() => router.push('/dashboard')}>
            <img src="/logo-wave.png" alt="Wave" className="topbar-logo" />
            <div className="topbar-brand-text">
              <span className="topbar-brand-name">WAVE SURF CLUB</span>
              <span className="topbar-brand-sub">ERP & LOGISTICS v2.0</span>
            </div>
          </button>

          <div className="topbar-divider" />

          <button className="sidebar-collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Toggle sidebar">
            <Menu size={18} />
          </button>

          <div className="topbar-breadcrumb">
            <span className="breadcrumb-root">Sistema</span>
            <ChevronRight size={14} className="breadcrumb-sep" />
            <span className="breadcrumb-current">{getPageTitle()}</span>
          </div>
        </div>

        <div className="topbar-center">
          {/* SAP-style System Status */}
          <div className="system-status">
            <span className="status-dot status-green" />
            <span className="status-label">Sistema Operativo</span>
          </div>
        </div>

        <div className="topbar-right-group">
          {/* Search */}
          <div className={`topbar-search-wrap ${searchOpen ? 'open' : ''}`}>
            <button className="topbar-icon-btn" onClick={() => setSearchOpen(!searchOpen)} title="Buscar módulo">
              <Search size={16} />
            </button>
            {searchOpen && (
              <div className="topbar-search-panel">
                <input
                  ref={searchRef}
                  className="topbar-search-input"
                  placeholder="Buscar módulo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(item => {
                      const key = item.path.split('/').pop() || 'dashboard';
                      return (
                        <button key={item.path} className="search-result-item" onClick={() => { router.push(item.path); setSearchOpen(false); setSearchQuery(''); }}>
                          {t(`nav.${key}`)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live clock */}
          <div className="topbar-clock hide-mobile">
            <Activity size={12} />
            <span>{currentTime}</span>
          </div>

          {/* Notifications */}
          <div className="topbar-notif-wrap" ref={notifRef}>
            <button className="topbar-icon-btn notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={16} />
              {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
            </button>
            
            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-header">
                  <span>Notificaciones de Venta</span>
                  <span className="notif-count">{notifications.length} nuevas</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No hay nuevas ventas por revisar</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="notif-item" onClick={() => markNotifAsReviewed(n.id)}>
                        <div className="notif-info">
                          <span className="notif-title">Nueva Venta: {n.id.split('-')[0].toUpperCase()}</span>
                          <span className="notif-client">{n.nombre_cliente} — ${n.total.toLocaleString('es-CL')}</span>
                          <span className="notif-time">{new Date(n.created_at).toLocaleTimeString('es-CL')}</span>
                        </div>
                        <div className="notif-status-icon">
                          <CheckCircle size={14} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button className="notif-footer" onClick={() => { router.push('/dashboard/tienda/ordenes'); setNotifOpen(false); }}>
                    Ver todas las órdenes
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Branch */}
          <div className="topbar-branch-wrap">
            <Building2 size={14} />
            <select
              className="topbar-branch-select"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
              disabled={user.role !== 'superadmin' && user.allowed_branches?.length <= 1}
            >
              {user.role === 'superadmin' && <option value="">Todas las sedes</option>}
              {BRANCHES.filter(b => user.role === 'superadmin' || user.allowed_branches?.includes(b.id)).map(b => (
                <option key={b.id} value={b.id}>{b.emoji} {b.shortName}</option>
              ))}
            </select>
            <ChevronDown size={12} />
          </div>

          {/* Lang flags */}
          <div className="topbar-lang" style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
            {LANGUAGES.slice(0, 3).map(language => (
              <button
                key={language.code}
                className={`lang-flag-btn ${lang === language.code ? 'active' : ''}`}
                onClick={() => changeLang(language.code)}
                title={language.name}
                style={{ fontSize: '18px', padding: '4px' }}
              >
                {language.flag}
              </button>
            ))}
          </div>

          {/* User */}
          <div className="topbar-user">
            <div className="topbar-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
            <div className="topbar-user-info hide-mobile">
              <span className="topbar-user-name">{user.name}</span>
              <span className="topbar-user-role">{user.role}</span>
            </div>
          </div>

          <button className="topbar-logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="erp-body">
        {/* ── SIDEBAR ── */}
        <aside className={`erp-sidebar ${isCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-scroll">
            {getNavGroups().map((group) => (
              <div key={group.label} className="nav-group">
                {!isCollapsed && <div className="nav-group-label">{group.label}</div>}
                {group.items.map(item => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname === item.path;
                  const key = item.path.split('/').pop() || 'dashboard';
                  const navLabel = t(`nav.${key}`);
                  return (
                    <button
                      key={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={isCollapsed ? navLabel : ''}
                      onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                    >
                      <span className={`nav-item-indicator ${isActive ? 'visible' : ''}`} />
                      {Icon && <Icon size={17} className="nav-item-icon" />}
                      {!isCollapsed && <span className="nav-item-label">{navLabel}</span>}
                      {isActive && !isCollapsed && <span className="nav-item-active-dot" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {!isCollapsed && (
            <div className="sidebar-system-info">
              <Zap size={12} />
              <span>WSC ERP v2.0 — {new Date().toLocaleDateString('es-CL')}</span>
            </div>
          )}
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="sidebar-overlay-mobile" onClick={() => setSidebarOpen(false)} />}

        {/* ── MAIN ── */}
        <main className="erp-main">
          <div className="erp-page-content">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile menu fab */}
      <button className="mobile-fab" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Styles */}
      <style jsx>{`
        /* ─── SHELL ─── */
        .erp-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #0b0f1a;
          color: #e2e8f0;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        /* ─── TOPBAR ─── */
        .erp-topbar {
          height: 52px;
          min-height: 52px;
          background: #0f1623;
          border-bottom: 1px solid #1e2a3a;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 100;
          position: relative;
        }

        .topbar-left-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .topbar-brand:hover { background: rgba(255,255,255,0.05); }

        .topbar-logo {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 6px;
        }

        .topbar-brand-text { display: flex; flex-direction: column; text-align: left; }
        .topbar-brand-name {
          font-size: 11px;
          font-weight: 900;
          color: #38bdf8;
          letter-spacing: 0.5px;
          line-height: 1;
        }
        .topbar-brand-sub {
          font-size: 9px;
          color: #475569;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        .topbar-divider {
          width: 1px;
          height: 24px;
          background: #1e2a3a;
        }

        .sidebar-collapse-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .sidebar-collapse-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }

        .topbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .breadcrumb-root { color: #475569; }
        .breadcrumb-sep { color: #334155; }
        .breadcrumb-current { color: #94a3b8; font-weight: 600; }

        /* Center */
        .topbar-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .system-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }
        .status-green {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .status-label { font-size: 10px; font-weight: 700; color: #10b981; letter-spacing: 0.5px; }

        /* Right group */
        .topbar-right-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .topbar-icon-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 7px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          position: relative;
        }
        .topbar-icon-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

        .notif-btn { position: relative; }
        .notif-badge {
          position: absolute;
          top: 3px; right: 3px;
          width: 14px; height: 14px;
          background: #ef4444;
          border-radius: 50%;
          font-size: 8px;
          font-weight: 800;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #0f1623;
          animation: bounce 0.5s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .topbar-notif-wrap { position: relative; }
        .notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background: #0f1623;
          border: 1px solid #1e2a3a;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          z-index: 300;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-header { padding: 12px 16px; background: #1a2236; border-bottom: 1px solid #1e2a3a; display: flex; justify-content: space-between; align-items: center; }
        .notif-header span { font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; }
        .notif-count { background: #38bdf8; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 9px !important; }

        .notif-list { max-height: 400px; overflow-y: auto; }
        .notif-empty { padding: 40px 20px; text-align: center; color: #475569; font-size: 12px; }

        .notif-item { padding: 12px 16px; border-bottom: 1px solid #1e2a3a; display: flex; gap: 12px; align-items: center; transition: all 0.2s; cursor: pointer; }
        .notif-item:hover { background: rgba(56,189,248,0.05); }
        .notif-item:hover .notif-title { color: #fff; }
        .notif-item:last-child { border-bottom: none; }

        .notif-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .notif-title { font-size: 12px; font-weight: 700; color: #38bdf8; transition: 0.2s; }
        .notif-client { font-size: 11px; color: #cbd5e1; }
        .notif-time { font-size: 10px; color: #475569; font-family: var(--font-mono); }

        .notif-status-icon { color: #64748b; opacity: 0.3; transition: 0.2s; }
        .notif-item:hover .notif-status-icon { color: #10b981; opacity: 1; transform: scale(1.1); }

        .notif-footer { width: 100%; padding: 10px; background: #0d1220; border: none; border-top: 1px solid #1e2a3a; color: #475569; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        .notif-footer:hover { color: #38bdf8; background: #0f1623; }

        .topbar-clock {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #475569;
          font-family: var(--font-mono, monospace);
          padding: 4px 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid #1e2a3a;
          border-radius: 6px;
        }

        /* Search */
        .topbar-search-wrap { position: relative; }
        .topbar-search-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: #0f1623;
          border: 1px solid #1e2a3a;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          z-index: 200;
        }
        .topbar-search-input {
          width: 100%;
          padding: 12px 14px;
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
          border-bottom: 1px solid #1e2a3a;
        }
        .search-results { }
        .search-result-item {
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          transition: all 0.15s;
          display: block;
        }
        .search-result-item:hover { background: rgba(56,189,248,0.08); color: #38bdf8; }

        /* Branch */
        .topbar-branch-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid #1e2a3a;
          border-radius: 7px;
          color: #64748b;
        }
        .topbar-branch-select {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }
        .topbar-branch-select option {
          background: #0f1623;
          color: #e2e8f0;
        }

        /* Lang */
        .topbar-lang { display: flex; gap: 2px; }
        .lang-flag-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.4;
          transition: 0.2s;
        }
        .lang-flag-btn:hover { opacity: 0.8; }
        .lang-flag-btn.active { opacity: 1; }

        /* User */
        .topbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid #1e2a3a;
        }
        .topbar-avatar {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #0ea5e9, #3b82f6);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
        }
        .topbar-user-info { display: flex; flex-direction: column; }
        .topbar-user-name { font-size: 12px; font-weight: 700; color: #cbd5e1; }
        .topbar-user-role { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }

        .topbar-logout-btn {
          background: none;
          border: 1px solid #1e2a3a;
          color: #64748b;
          cursor: pointer;
          padding: 7px 9px;
          border-radius: 7px;
          display: flex; align-items: center;
          transition: all 0.2s;
        }
        .topbar-logout-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }

        /* ─── BODY ─── */
        .erp-body {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ─── SIDEBAR ─── */
        .erp-sidebar {
          width: 230px;
          min-width: 230px;
          background: #0d1220;
          border-right: 1px solid #1a2236;
          display: flex;
          flex-direction: column;
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s;
          overflow: hidden;
          z-index: 50;
        }
        .erp-sidebar.collapsed { width: 56px; min-width: 56px; }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 8px;
          scrollbar-width: thin;
          scrollbar-color: #1e2a3a transparent;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 4px; }

        /* Nav groups */
        .nav-group { margin-bottom: 6px; }
        .nav-group-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #334155;
          padding: 8px 10px 4px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .nav-item {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          margin-bottom: 2px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .nav-item.active {
          background: linear-gradient(90deg, rgba(56,189,248,0.12) 0%, transparent 100%);
          color: #38bdf8;
        }

        .nav-item-indicator {
          position: absolute;
          left: 0; top: 6px; bottom: 6px;
          width: 3px;
          background: #38bdf8;
          border-radius: 0 3px 3px 0;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .nav-item-indicator.visible { opacity: 1; }

        .nav-item-icon { flex-shrink: 0; }
        .nav-item-label { font-size: 12.5px; font-weight: 600; flex: 1; }
        .nav-item-active-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          flex-shrink: 0;
        }

        .sidebar-system-info {
          padding: 10px 14px;
          border-top: 1px solid #1a2236;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
        }

        /* Mobile overlay */
        .sidebar-overlay-mobile {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 49;
        }

        /* ─── MAIN ─── */
        .erp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #10151f;
        }

        .erp-page-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px;
          scrollbar-width: thin;
          scrollbar-color: #1e2a3a transparent;
        }
        .erp-page-content::-webkit-scrollbar { width: 6px; }
        .erp-page-content::-webkit-scrollbar-track { background: transparent; }
        .erp-page-content::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 6px; }

        /* Mobile FAB */
        .mobile-fab {
          display: none;
          position: fixed;
          bottom: 20px; right: 20px;
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #0ea5e9, #3b82f6);
          border: none;
          border-radius: 14px;
          color: #fff;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          touch-action: manipulation;
        }

        /* Utilities */
        .hide-mobile { }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1023px) {
          .erp-sidebar {
            position: fixed;
            top: 52px; left: 0;
            bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.3s;
            z-index: 90;
            width: 230px !important;
            min-width: 230px !important;
          }
          .erp-sidebar.mobile-open { transform: translateX(0); }
          .sidebar-overlay-mobile { display: block; }
          .mobile-fab { display: flex; }
          .hide-mobile { display: none !important; }
          .topbar-center { display: none; }
          .topbar-clock { display: none; }
          .topbar-lang { display: none; }
          .topbar-brand-sub { display: none; }
          .topbar-brand-name { font-size: 10px !important; }
          .topbar-logo { height: 20px !important; }
          .topbar-divider { display: none; }
          .topbar-breadcrumb { display: none; }
          .erp-page-content { padding: 20px 16px; }
          .topbar-branch-wrap { 
            padding: 4px 6px; 
            max-width: 100px;
          }
          .topbar-branch-select { font-size: 10px; }
        }
      `}</style>
    </div>
    </BranchContext.Provider>
  );
}
