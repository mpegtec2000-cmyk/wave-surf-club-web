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

  // EXACT ORDER PROVIDED BY USER
  const menuItems = [
    { id: 'inicio', key: 'menu_inicio', href: '/', type: 'route' },
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
    setMenuOpen(false);
  };

  return (
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 999999,
        borderBottom: '2px solid #000',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none'
      }}
      className="nav-luxury-container"
    >
      {/* LOGO BOX - LEFT (Black Square) */}
      <div className="logo-box">
        <Link href="/" style={{ display: 'block', position: 'relative', width: '100%', height: '100%', padding: '15%' }}>
          <Image 
            src="/logo-wave.png" 
            alt="Wave Surf Club" 
            fill
            sizes="(max-width: 1024px) 50px, 95px"
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
            display: 'none' // Controlled by CSS :hover
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

        {/* MOBILE MENU TOGGLE */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(true)}>
          <Menu size={32} />
        </button>
      </div>

      {/* MOBILE FLYOUT */}
      {menuOpen && (
        <div className="mobile-flyout">
          <div className="flyout-header">
            <button 
              onClick={() => setMenuOpen(false)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}
            >
              <X size={32} />
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
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '30px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
             {/* ACCESOS en Mobile */}
             <div style={{ display: 'flex', gap: '15px' }}>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#000', padding: '10px 15px', border: '1px solid #000', borderRadius: '4px' }}>{t('landing.btn_colaborador')}</Link>
                <Link href="/agenda" onClick={() => setMenuOpen(false)} style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#000', padding: '10px 15px', border: '1px solid #000', borderRadius: '4px' }}>{t('landing.btn_cliente')}</Link>
             </div>

             {/* IDIOMA en Mobile */}
             <div>
               <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '2px', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>LENGUAJE / LANGUAGE</span>
               <div style={{ display: 'flex', gap: '10px' }}>
                  {LANGUAGES.map(l => (
                    <button 
                      key={l.code} 
                      onClick={() => { changeLang(l.code); setMenuOpen(false); }}
                      style={{ 
                        padding: '8px 12px', 
                        background: lang === l.code ? '#000' : 'none', 
                        color: lang === l.code ? '#fff' : '#000',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '900'
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
          height: 95px;
          padding: 0 30px 0 0;
        }
        .logo-box {
          background-color: #000;
          width: 95px;
          height: 95px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;
        }
        .nav-menu-desktop {
          flex: 1;
          display: flex;
          justify-content: center;
          overflowX: auto;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-left: 15px;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #38bdf8;
        }

        .dropdown:hover .dropdown-content { display: block !important; }
        .nav-link-luxury:hover { color: #38bdf8 !important; }

        .nav-link-agenda { 
          color: #38bdf8 !important; 
          text-decoration: underline !important; 
          text-underline-offset: 4px;
          display: inline-block;
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
          overflow-y: auto;
        }
        .flyout-header { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .flyout-links { display: flex; flex-direction: column; gap: 15px; }
        .flyout-links a { 
          font-size: 28px; 
          font-weight: 950; 
          text-decoration: none; 
          color: #000; 
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }

        @media (max-width: 1023px) {
          .nav-menu-desktop, .nav-action-desktop {
            display: none !important;
          }
          .mobile-toggle {
            display: block;
          }
          .nav-luxury-container {
            height: 70px;
            padding: 0 15px 0 0;
          }
          .logo-box {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>

    </nav>


  );
}
