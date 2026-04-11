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
      <style jsx global>{`
        body.menu-open { overflow: hidden !important; }
        
        .mobile-toggle-btn {
          display: none;
          position: fixed;
          top: 15px;
          right: 20px;
          z-index: 10000000;
          background: #000;
          color: #fff;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .mobile-flyout-overlay {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 9999999;
          display: flex;
          flex-direction: column;
          padding: 40px;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .flyout-nav-links {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 40px;
        }

        .flyout-nav-links a {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: -0.04em;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }

        @media (max-width: 1023px) {
          .nav-menu-desktop, .nav-action-desktop { display: none !important; }
          .mobile-toggle-btn { display: flex !important; }
        }
      `}</style>

      <button 
        className="mobile-toggle-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <nav 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: scrolled ? '75px' : '95px',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 999999,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          visibility: menuOpen ? 'hidden' : 'visible'
        }}
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

          </div>
        </div>
      </nav>

      {/* MOBILE FLYOUT - FULL SCREEN DARK STYLE */}
      {menuOpen && (
        <div className="mobile-flyout-overlay">
          <div className="flyout-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Image src="/logo-wave.png" alt="Logo" width={50} height={50} style={{ filter: 'invert(1)', objectFit: 'contain' }} />
          </div>

          <div className="flyout-nav-links">
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
              >
                {item.id === 'carro' ? t('landing.menu_carro').replace('(0)', `(${cartCount})`) : t(`landing.${item.key}`)}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ background: '#fff', color: '#000', padding: '15px', textAlign: 'center', borderRadius: '8px', fontWeight: 900, textDecoration: 'none' }}>
              {t('landing.btn_colaborador')}
            </Link>
            <Link href="/agenda" onClick={() => setMenuOpen(false)} style={{ border: '1px solid #fff', color: '#fff', padding: '15px', textAlign: 'center', borderRadius: '8px', fontWeight: 900, textDecoration: 'none' }}>
              {t('landing.btn_cliente')}
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .logo-box {
          background-color: #000;
          width: 95px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 25px;
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .logo-box { width: 75px; }
        }

        .nav-menu-desktop {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .nav-link-luxury:hover { color: #38bdf8; }
        .dropdown:hover .dropdown-content { display: block !important; }
      `}</style>
    </>
  );
}
