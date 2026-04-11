'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Globe, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';

export default function Navbar({ cartCount = 0, onCartClick }) {
  const { lang, changeLang, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const LANGUAGES = [
    { code: 'es', name: 'ES' },
    { code: 'en', name: 'EN' },
    { code: 'pt', name: 'PT' },
    { code: 'de', name: 'DE' }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  // EXACT ORDER PROVIDED BY USER
  const menuItems = [
    { id: 'inicio', key: 'menu_inicio', href: '/', type: 'route' },
    { id: 'biografia', key: 'menu_bio', href: '/biografia', type: 'route' },
    { id: 'escuelas', key: 'menu_escuelas', href: '/escuelas', type: 'route' },
    { id: 'servicios', key: 'menu_servicios', href: '/servicios', type: 'route' },
    { id: 'equipo', key: 'menu_equipo', href: '/equipo', type: 'route' },
    { id: 'taller', key: 'menu_taller', href: '/taller', type: 'route' },
    { id: 'riders', key: 'menu_riders', href: '/riders', type: 'route' },
    { id: 'tienda', key: 'menu_tienda', href: '/tienda', type: 'route' },
    { id: 'contenido', key: 'menu_contenido', href: '/#contenido', type: 'anchor' },
    { id: 'agenda', key: 'menu_agenda', href: '/agenda', type: 'route' },
    { id: 'contacto', key: 'menu_contacto', href: '/#contacto', type: 'anchor' },
    { id: 'eventos', key: 'menu_eventos', href: '/eventos', type: 'route' },
    { id: 'carro', key: 'menu_carro', href: '#', type: 'cart' },
  ];

  const handleScrollTo = (e, id) => {
    setMenuOpen(false);
    if (window.location.pathname !== '/') {
      // Allow default Link behavior for hash links from other pages
      return; 
    }
    
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const isMobile = window.innerWidth < 1024;
      const offset = isMobile ? 70 : 95;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 999999,
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none'
      }}
      className="nav-luxury-container"
    >
      {/* LOGO BOX - LEFT (Black Square) */}
      <div className="logo-box">
        <Link href="/" style={{ display: 'block', position: 'relative', width: '100%', height: '100%', padding: '18%' }}>
          <Image 
            src="/logo-wave.png" 
            alt="Wave Surf Club" 
            fill
            sizes="(max-width: 1024px) 70px, 95px"
            priority
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* MENU - CENTER (Desktop only) */}
      <div className="nav-menu-desktop">
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '12px',
          margin: 0,
          padding: 0,
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          {menuItems.map((item, idx) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                href={item.href}
                onClick={item.type === 'anchor' ? (e) => handleScrollTo(e, item.id) : item.type === 'cart' ? (e) => { e.preventDefault(); onCartClick && onCartClick(); } : undefined}
                className={`nav-link-luxury ${item.id === 'agenda' ? 'nav-link-agenda' : item.id === 'carro' ? 'nav-link-cart' : ''}`}
                style={{
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#000',
                  textDecoration: 'none',
                  padding: '10px 4px',
                  transition: 'color 0.2s'
                }}
              >
                {item.id === 'carro' ? t('landing.menu_carro').replace('(0)', `(${cartCount})`) : t(`landing.${item.key}`)}
              </Link>
              {idx < menuItems.length - 1 && (
                <span style={{ 
                  margin: '0 2px', 
                  color: '#000', 
                  opacity: 0.15, 
                  fontSize: '14px', 
                  fontWeight: '300' 
                }}>/</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="nav-actions">
        
        {/* INGRESOS Dropdown (Desktop only) */}
        <div className="dropdown nav-action-desktop" style={{ position: 'relative' }}>
          <button className="dropdown-trigger" style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 5px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>{t('landing.btn_ingreso')}</span>
            <ChevronDown size={14} />
          </button>
          <div className="dropdown-content" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            border: '2px solid #000',
            minWidth: '200px',
            zIndex: 1000,
            display: 'none'
          }}>
            <Link href="/login" style={{ display: 'block', padding: '15px', textDecoration: 'none', color: '#000', fontSize: '11px', fontWeight: '900', borderBottom: '1px solid #eee' }}>{t('landing.btn_colaborador')}</Link>
            <Link href="/agenda" style={{ display: 'block', padding: '15px', textDecoration: 'none', color: '#000', fontSize: '11px', fontWeight: '900' }}>{t('landing.btn_cliente')}</Link>
          </div>
        </div>

        {/* IDIOMA Dropdown (Desktop only) */}
        <div className="dropdown nav-action-desktop" style={{ position: 'relative' }}>
          <button className="dropdown-trigger" style={{
            background: 'none',
            border: '1px solid #000',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Globe size={14} />
            <span style={{ fontSize: '11px', fontWeight: '900' }}>{lang.toUpperCase()}</span>
          </button>
          <div className="dropdown-content" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            border: '2px solid #000',
            minWidth: '100px',
            zIndex: 1000,
            display: 'none'
          }}>
            {LANGUAGES.map(l => (
              <button 
                key={l.code} 
                onClick={() => changeLang(l.code)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '12px', 
                  textAlign: 'left', 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: '1px solid #eee',
                  fontSize: '11px', 
                  fontWeight: '900',
                  cursor: 'pointer' 
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* LOGIN ICON (Mobile only) */}
        <Link href="/login" className="mobile-login-icon">
          <User size={24} />
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(true)}>
          <Menu size={28} />
        </button>
      </div>
    </nav>

    {/* MOBILE FLYOUT - MOVED OUTSIDE NAV TO PREVENT CLIPPING */}
    {menuOpen && (
      <div className="mobile-flyout">
        <div className="flyout-header">
          <div className="flyout-logo-box">
             <Image src="/logo-wave.png" alt="Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
          </div>
          <button 
            onClick={() => setMenuOpen(false)} 
            style={{ background: '#000', border: 'none', cursor: 'pointer', color: '#fff', padding: '10px', borderRadius: '50%' }}
          >
            <X size={24} />
          </button>
        </div>
        <div className="flyout-links">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (item.type === 'anchor') {
                  handleScrollTo(e, item.id);
                } else if (item.type === 'cart') {
                  e.preventDefault();
                  onCartClick && onCartClick();
                  setMenuOpen(false);
                } else {
                  setMenuOpen(false);
                }
              }}
              className={item.id === 'agenda' ? 'nav-link-agenda' : ''}
            >
              {item.id === 'carro' ? t('landing.menu_carro').replace('(0)', `(${cartCount})`) : t(`landing.${item.key}`)}
            </Link>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '30px', borderTop: '2px solid #eee', paddingTop: '40px' }}>
           {/* ACCESOS en Mobile */}
           <div>
             <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '2px', color: '#94a3b8', display: 'block', marginBottom: '15px' }}>ACCESO / LOGIN</span>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)} 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    color: '#fff', 
                    background: '#000',
                    padding: '20px', 
                    textAlign: 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    letterSpacing: '1px'
                  }}
                >
                  {t('landing.btn_colaborador')}
                </Link>
                <Link 
                  href="/agenda" 
                  onClick={() => setMenuOpen(false)} 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    color: '#000', 
                    padding: '18px', 
                    textAlign: 'center',
                    border: '2px solid #000',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    letterSpacing: '1px'
                  }}
                >
                  {t('landing.btn_cliente')}
                </Link>
             </div>
           </div>

           {/* IDIOMA en Mobile */}
           <div>
             <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '2px', color: '#94a3b8', display: 'block', marginBottom: '15px' }}>LENGUAJE / LANGUAGE</span>
             <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {LANGUAGES.map(l => (
                  <button 
                    key={l.code} 
                    onClick={() => { changeLang(l.code); setMenuOpen(false); }}
                    style={{ 
                      padding: '12px 20px', 
                      background: lang === l.code ? '#38bdf8' : 'none', 
                      color: lang === l.code ? '#fff' : '#000',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      fontSize: '13px', 
                      fontWeight: '900',
                      cursor: 'pointer',
                      flex: 1,
                      minWidth: '70px'
                    }}
                  >
                    {l.name}
                  </button>
                ))}
             </div>
           </div>
        </div>
      </div>
    )}

    <style jsx>{`
        .nav-luxury-container {
          height: var(--nav-height, 95px);
          padding: 0 30px 0 0;
        }
        .logo-box {
          background-color: #000;
          width: var(--nav-height, 95px);
          height: var(--nav-height, 95px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 25px;
          flex-shrink: 0;
          transition: all 0.4s ease;
        }
        .nav-menu-desktop {
          flex: 1;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-left: 20px;
        }
        .mobile-toggle {
          display: none;
          background: #000;
          border: none;
          cursor: pointer;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 4px;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        .mobile-login-icon {
          display: none;
          color: #000;
          padding: 8px;
        }

        .dropdown:hover .dropdown-content { display: block !important; }
        .nav-link-luxury:hover { color: #38bdf8 !important; }

        .nav-link-agenda { 
          color: #38bdf8 !important; 
          text-decoration: underline !important; 
          text-underline-offset: 4px;
        }

        .nav-link-cart {
          background: #000;
          color: #fff !important;
          padding: 6px 14px !important;
          border-radius: 20px;
        }
        
        .mobile-flyout {
          position: fixed;
          inset: 0;
          background: #fdfcfb;
          z-index: 1000000;
          display: flex;
          flex-direction: column;
          padding: 20px 30px 40px;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .flyout-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 40px; 
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .flyout-links { display: flex; flex-direction: column; gap: 12px; }
        .flyout-links a { 
          font-size: 28px; 
          font-weight: 950; 
          text-decoration: none; 
          color: #000; 
          text-transform: uppercase;
          letter-spacing: -0.04em;
          line-height: 1.1;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          padding-bottom: 5px;
        }

        @media (max-width: 1023px) {
          .nav-menu-desktop, .nav-action-desktop {
            display: none !important;
          }
          .mobile-toggle, .mobile-login-icon {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
