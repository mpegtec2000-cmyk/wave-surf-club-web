import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { usePathname } from 'next/navigation';

export default function Navbar({ cartCount = 0, onCartClick }) {
  const { lang, changeLang, t } = useTranslation();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const LANGUAGES = [
    { code: 'es', label: 'Español' }, { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' }, { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' }, { code: 'ru', label: 'Русский' }
  ];

  const isHome = pathname === '/';

  const getLink = (id) => isHome ? `#${id}` : `/#${id}`;

  const handleHomeClick = (e) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const menuItems = [
    { id: 'biografia', key: 'menu_bio', href: getLink('biografia'), type: 'anchor' },
    { id: 'escuelas', key: 'menu_escuelas', href: getLink('escuelas'), type: 'anchor' },
    { id: 'servicios', key: 'menu_servicios', href: '/servicios', type: 'route' },
    { id: 'equipo', key: 'menu_equipo', href: '/equipo', type: 'route' },
    { id: 'taller', key: 'menu_taller', href: '/taller', type: 'route' },
    { id: 'riders', key: 'menu_riders', href: '/riders', type: 'route' },
    { id: 'tienda', key: 'menu_tienda', href: getLink('tienda'), type: 'anchor' },
    { id: 'contenido', key: 'menu_contenido', href: getLink('contenido'), type: 'anchor' },
    { id: 'agenda', key: 'menu_agenda', href: '/agenda', type: 'route', color: '#0ea5e9' },
    { id: 'contacto', key: 'menu_contacto', href: getLink('contacto'), type: 'anchor' },
    { id: 'eventos', key: 'menu_eventos', href: getLink('eventos'), type: 'anchor' },
  ];

  return (
    <>
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 100px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid #000;
        }

        .nav-left, .nav-right {
          flex: 1;
          display: flex;
          align-items: center;
        }
        .nav-left { justify-content: flex-start; gap: 24px; }
        
        .mobile-btn {
          display: none;
          background: transparent;
          border: none;
          color: #1e293b;
          font-size: 24px;
          cursor: pointer;
        }

        .nav-center {
          flex: 4;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .nav-right { justify-content: flex-end; }

        .logo-img { height: 70px; width: auto; object-fit: contain; display: block; cursor: pointer; }

        .dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-trigger {
          background: transparent;
          color: #000;
          border: 1px solid #000;
          padding: 6px 15px;
          border-radius: 4px;
          font-family: var(--font-archivo), sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dropdown-trigger:hover { 
          background: #000;
          color: #fff;
        }

        .dropdown-content {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          min-width: 240px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          border-radius: 4px;
          border: 2px solid #000;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          z-index: 2000;
        }
        .dropdown:hover .dropdown-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-content button, .dropdown-content a {
          display: block;
          width: 100%;
          text-align: left;
          padding: 18px 20px;
          color: #1e293b;
          text-decoration: none;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          font-family: var(--font-archivo), sans-serif;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropdown-content button:hover, .dropdown-content a:hover {
          background: #000;
          color: #fff;
          padding-left: 25px;
        }

        .lang-dropdown .dropdown-content { right: 0; min-width: 150px; }

        .massive-menu {
          display: flex;
          flex-wrap: nowrap;
          white-space: nowrap;
          align-items: center;
          list-style: none;
          margin: 0; padding: 0;
          gap: 10px;
          font-family: var(--font-archivo), sans-serif;
        }
        :global(.massive-menu li a), :global(.nav-link) {
          color: #000 !important;
          text-decoration: none !important;
          font-family: var(--font-archivo), sans-serif !important;
          font-size: 0.95rem !important;
          font-weight: 900 !important;
          letter-spacing: -0.05em !important;
          text-transform: uppercase !important;
          transition: color 0.3s !important;
          display: inline-block !important;
        }
        :global(.massive-menu li a:hover), :global(.nav-link:hover) { color: #2563eb !important; }
        :global(.slash) { color: #000 !important; font-size: 11px !important; margin: 0 4px !important; font-weight: 900 !important; }

        @media (max-width: 1200px) {
          .nav-center { display: none; }
          .mobile-btn { display: block; }
          .nav-left { gap: 12px; }
          .header { padding: 0 20px; }
        }

        .mobile-flyout {
          position: fixed;
          top: 100px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px;
          overflow-y: auto;
        }
        :global(.mobile-flyout a) {
          color: #000 !important;
          text-decoration: none !important;
          font-family: var(--font-archivo), sans-serif !important;
          font-size: 24px !important;
          font-weight: 900 !important;
          letter-spacing: -1px !important;
          text-transform: uppercase !important;
        }
        .mobile-flyout .mobile-slash { display: none; }
      `}</style>

      <header className="header">
        <div className="nav-left">
          <Link href="/" onClick={handleHomeClick}>
            <img src="/logo-wave.png" alt="Wave Surf Club" className="logo-img" />
          </Link>
          
          <nav className="nav-center">
            <ul className="massive-menu">
              <li>
                <Link 
                  href={isHome ? '#' : '/'} 
                  onClick={handleHomeClick}
                  className="nav-link"
                >
                  {t('landing.menu_inicio')}
                </Link>
              </li>
              <span className="slash">/</span>
              
              {menuItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <li>
                    <Link 
                      href={item.href} 
                      className="nav-link"
                      style={item.color ? { color: item.color } : {}}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(`landing.${item.key}`)}
                    </Link>
                  </li>
                  {index < menuItems.length - 1 && <span className="slash">/</span>}
                </React.Fragment>
              ))}
              <span className="slash">/</span>
              <li>
                <a 
                  className="nav-link"
                  style={{ color: '#2563eb', cursor: onCartClick ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (onCartClick) {
                      e.preventDefault();
                      onCartClick();
                    }
                  }}
                >
                  {t('landing.menu_carro').replace('(0)', `(${cartCount})`)}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="nav-right">
          <div className="dropdown">
            <button className="dropdown-trigger">{t('landing.btn_ingreso')} ▼</button>
            <div className="dropdown-content">
              <Link href="/agenda">{t('landing.btn_cliente')}</Link>
              <Link href="/login">{t('landing.btn_colaborador')}</Link>
            </div>
          </div>
          
          <div className="dropdown lang-dropdown" style={{ marginLeft: '20px' }}>
            <button className="dropdown-trigger">{LANGUAGES.find(l => l.code === lang)?.code.toUpperCase()} ▼</button>
            <div className="dropdown-content">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ marginLeft: '20px' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-flyout">
          <Link href={isHome ? '#' : '/'} onClick={handleHomeClick}>{t('landing.menu_inicio')}</Link>
          {menuItems.map(item => (
            <Link key={item.id} href={item.href} onClick={() => setMenuOpen(false)}>
              {t(`landing.${item.key}`)}
            </Link>
          ))}
          <a 
            style={{ color: '#2563eb', fontSize: '24px' }}
            onClick={(e) => {
              if (onCartClick) {
                e.preventDefault();
                onCartClick();
                setMenuOpen(false);
              }
            }}
          >
            {t('landing.menu_carro').replace('(0)', `(${cartCount})`)}
          </a>
        </div>
      )}
    </>
  );
}

