'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/lib/data';
import { NAV_ITEMS, BRANCHES, LANGUAGES } from '@/lib/constants';
import { BranchContext } from '@/lib/branch-context';
import { useTranslation } from '@/lib/i18n-context';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  FileText, Settings, LogOut, Menu, X, Briefcase, ChevronRight, BarChart3, TrendingUp, TrendingDown
} from 'lucide-react';

const iconMap = {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, Briefcase, BarChart3, TrendingUp, TrendingDown
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { t, lang, changeLang } = useTranslation();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    setUser(u);
    setSelectedBranch(u.allowed_branches?.[0] || 1);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.replace('/login');
  };

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const currentBranch = BRANCHES.find(b => b.id === selectedBranch);

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(i => i.path === pathname);
    if (!item) return t('nav.dashboard');
    const key = item.path.split('/').pop() || 'dashboard';
    return t(`nav.${key}`);
  };

  return (
    <BranchContext.Provider value={{ activeBranchId: selectedBranch, setActiveBranchId: setSelectedBranch }}>
    <div className="dashboard-layout">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle-btn hide-mobile" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir Menú" : "Contraer Menú"}
        >
          <ChevronRight size={14} />
        </button>

        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div style={{ position: 'relative', width: '44px', height: '44px', marginRight: '12px' }}>
              <Image 
                src="/logo-pag.png" 
                alt="Logo" 
                fill 
                sizes="44px"
                className="sidebar-brand-img"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <h2>WAVE SURF CLUB</h2>
              <span>Since 2015</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.path;
            const navLabel = t(`nav.${item.path.split('/').pop() || 'dashboard'}`);
            
            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? navLabel : ""}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
              >
                {Icon && <Icon size={20} className="sidebar-nav-icon" />}
                <span>{navLabel}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info fade-in">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            {/* 8 Language flags */}
            <div className="lang-selector">
              {LANGUAGES.map(language => (
                <button
                  key={language.code}
                  className={`lang-btn ${lang === language.code ? 'active' : ''}`}
                  onClick={() => changeLang(language.code)}
                  title={language.name}
                >
                  {language.flag}
                </button>
              ))}
            </div>

            {/* Branch selector - Now available to anyone, but limited by allowed_branches */}
            <div className="branch-selector">
              <select
                value={selectedBranch || ''}
                onChange={(e) => setSelectedBranch(Number(e.target.value))}
                disabled={user.role !== 'superadmin' && user.allowed_branches?.length <= 1}
              >
                {user.role === 'superadmin' && <option value="">Todas las sedes</option>}
                {BRANCHES.filter(b => user.role === 'superadmin' || user.allowed_branches?.includes(b.id)).map(b => (
                  <option key={b.id} value={b.id}>{b.emoji} {b.shortName}</option>
                ))}
              </select>
            </div>

            <button className="topbar-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="hide-mobile">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
    </BranchContext.Provider>
  );
}
