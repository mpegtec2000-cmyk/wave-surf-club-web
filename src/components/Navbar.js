'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

  // EXACT ORDER PROVIDED BY USER
  const menuItems = [
    { id: 'inicio', key: 'menu_inicio', href: '/#hero', type: 'anchor' },
    { id: 'biografia', key: 'menu_bio', href: '/biografia', type: 'route' },
    { id: 'escuelas', key: 'menu_escuelas', href: '/escuelas', type: 'route' },
    { id: 'servicios', key: 'menu_servicios', href: '/servicios', type: 'route' },
    { id: 'equipo', key: 'menu_equipo', href: '/equipo', type: 'route' },
    { id: 'taller', key: 'menu_taller', href: '/taller', type: 'route' },
    { id: 'riders', key: 'menu_riders', href: '/riders', type: 'route' },
    { id: 'tienda', key: 'menu_tienda', href: '/#tienda', type: 'anchor' },
    { id: 'contenido', key: 'menu_contenido', href: '/#contenido', type: 'anchor' },
    { id: 'agenda', key: 'menu_agenda', href: '/agenda', type: 'route' },
    { id: 'contacto', key: 'menu_contacto', href: '/#contacto', type: 'anchor' },
    { id: 'eventos', key: 'menu_eventos', href: '/eventos', type: 'route' },
    { id: 'carro', key: 'menu_carro', href: '#', type: 'cart' },
  ];

  const handleScrollTo = (e, id) => {
    if (window.location.pathname !== '/') return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 95;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMenuOpen(false);
  };

  return (
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '95px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px 0 0',
        zIndex: 999999,
        borderBottom: '2px solid #000',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none'
      }}
      className="nav-luxury-container"
    >
      {/* LOGO BOX - LEFT (Black Square) */}
      <div style={{
        backgroundColor: '#000',
        width: '95px',
        height: '95px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px',
        flexShrink: 0
      }}>
        <Link href="/">
          <img src="/logo-wave.png" alt="Wave Surf Club" style={{ width: '65%', height: 'auto', display: 'block' }} />
        </Link>
      </div>

      {/* MENU - CENTER (Desktop only) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        overflowX: 'auto',
        scrollbarWidth: 'none' 
      }} className="hidden lg:flex">
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '8px',
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
                  letterSpacing: '0.05em',
                  color: '#000',
                  textDecoration: 'none',
                  padding: '5px 2px',
                  transition: 'color 0.2s'
                }}
              >
                {item.id === 'carro' ? t('landing.menu_carro').replace('(0)', `(${cartCount})`) : t(`landing.${item.key}`)}
              </Link>
              {idx < menuItems.length - 1 && (
                <span style={{ 
                  margin: '0 4px', 
                  color: '#000', 
                  opacity: 0.3, 
                  fontSize: '14px', 
                  fontWeight: '300' 
                }}>/</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT ACTIONS (Ingresos / Idioma) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingLeft: '15px' }}>
        
        {/* INGRESOS Dropdown */}
        <div className="dropdown" style={{ position: 'relative' }}>
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
            display: 'none' // Controlled by CSS :hover
          }}>
            <Link href="/login" style={{ display: 'block', padding: '15px', textDecoration: 'none', color: '#000', fontSize: '11px', fontWeight: '900', borderBottom: '1px solid #eee' }}>{t('landing.btn_colaborador')}</Link>
            <Link href="/agenda" style={{ display: 'block', padding: '15px', textDecoration: 'none', color: '#000', fontSize: '11px', fontWeight: '900' }}>{t('landing.btn_cliente')}</Link>
          </div>
        </div>

        {/* IDIOMA Dropdown */}
        <div className="dropdown" style={{ position: 'relative' }}>
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

        {/* MOBILE MENU TOGGLE */}
        <button className="lg:hidden" onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={28} />
        </button>
      </div>

      <style jsx>{`
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
          padding: 4px 10px !important;
          border-radius: 20px;
        }
        
        /* Mobile flyout styles */
        .mobile-flyout {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 1000000;
          display: flex;
          flex-direction: column;
          padding: 40px;
        }
        .flyout-header { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .flyout-links { display: flex; flex-direction: column; gap: 20px; }
        .flyout-links a { 
          font-size: 24px; 
          font-weight: 900; 
          text-decoration: none; 
          color: #000; 
          text-transform: uppercase;
        }
      `}</style>
    </nav>
  );
}
