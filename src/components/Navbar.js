'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe, User, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useCart } from '@/lib/cart-context';

export default function Navbar() {
  const { cartItems } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartCount = safeCartItems.length;
  const { lang, changeLang, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);
  const [scrollVal, setScrollVal] = useState(0);

  const LANGUAGES = [
    { code: 'es', name: 'ES' },
    { code: 'en', name: 'EN' },
    { code: 'pt', name: 'PT' },
    { code: 'fr', name: 'FR' },
    { code: 'de', name: 'DE' },
    { code: 'zh', name: 'ZH' },
    { code: 'ar', name: 'AR' },
    { code: 'ru', name: 'RU' },
    { code: 'ja', name: 'JA' },
    { code: 'ko', name: 'KO' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [menuOpen]);

  const menuItems = [
    { id: 'inicio', key: 'menu_inicio', href: '/', type: 'route' },
    { id: 'escuelas', key: 'menu_escuelas', href: '/escuelas', type: 'route' },
    { id: 'equipo', key: 'menu_equipo', href: '/equipo', type: 'route' },
    { id: 'taller', key: 'menu_taller', href: '/taller', type: 'route' },
    { id: 'riders', key: 'menu_riders', href: '/riders', type: 'route' },
    { id: 'tienda', key: 'menu_tienda', href: '/tienda', type: 'route' },
    { id: 'agenda', key: 'menu_agenda', href: '/tienda', type: 'route' },
    { id: 'contacto', key: 'menu_contacto', href: '/contacto', type: 'route' },
    { id: 'eventos', key: 'menu_eventos', href: '/eventos', type: 'route' },
    { id: 'carro', key: 'menu_carro', href: '/cart', type: 'route' },
  ];

  const handleScrollTo = (e, id) => {
    setMenuOpen(false);
    if (window.location.pathname !== '/') return;
    
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = window.innerWidth < 1024 ? 70 : 95;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style jsx global>{`
        body.menu-open { overflow: hidden !important; }
        
        .mobile-menu-wrapper {
          display: none;
          position: fixed;
          top: 13px; /* Centrado respecto al navbar de 70px */
          right: 20px;
          z-index: 10000001;
          align-items: center;
        }

        .mobile-menu-label {
          font-size: 11px;
          font-weight: 900;
          margin-right: 12px;
          letter-spacing: -0.05em;
          text-transform: uppercase;
          color: #000;
          display: flex;
          align-items: center;
        }

        .mobile-toggle-btn {
          background: #000;
          color: #fff;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }
        .mobile-toggle-btn:active { transform: scale(0.9); }

        .mobile-flyout-overlay {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 10000000;
          display: flex;
          flex-direction: column;
          padding: 30px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE */
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-flyout-overlay::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .flyout-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 40px 0;
        }

        .flyout-links a {
          font-size: 24px;
          font-weight: 900;
          color: #fff;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 8px;
        }

        .pulse-arrow {
          animation: customPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          margin-left: 6px;
          font-size: 15px;
        }
        
        @keyframes customPulse {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50% { opacity: .5; transform: translateX(-4px); }
        }

        @keyframes attention-pulse {
          0%, 100% { transform: scale(1); text-shadow: 0 0 0px rgba(56, 189, 248, 0); }
          50% { transform: scale(1.05); text-shadow: 0 0 8px rgba(56, 189, 248, 0.5); }
        }

        .agenda-attention {
          color: #38bdf8 !important;
          animation: attention-pulse 2s ease-in-out infinite;
          display: inline-block;
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .logo-pulsing {
          animation: logo-pulse 2s ease-in-out infinite;
          display: block;
        }

        @media (max-width: 1023px) {
          .nav-luxury-container { height: 70px !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-wrapper { display: flex !important; }
          .logo-box-luxury { width: 70px !important; }
        }

        /* Language Slider Styles */
        .lang-slider::-webkit-slider-thumb {
          appearance: none;
          width: 30px;
          height: 6px;
          background: #000;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .lang-slider::-webkit-slider-thumb:hover {
          background: #38bdf8;
        }
        .lang-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* MOBILE MENU WRAPPER - ESCAPES ALL NESTING */}
      <div className="mobile-menu-wrapper">
        {!menuOpen && (
          <span className="mobile-menu-label">
            MENÚ FECHA <span className="pulse-arrow">←</span>
          </span>
        )}
        <button className="mobile-toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MAIN NAVBAR */}
      <nav 
        className="nav-luxury-container"
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
        <div className="logo-box-luxury" style={{ backgroundColor: '#000', width: '95px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' }}>
          <Link href="/" className="logo-pulsing" style={{ position: 'relative', width: '60%', height: '60%' }}>
            <Image src="/logo-wave.png" alt="Wave" fill style={{ objectFit: 'contain' }} priority />
          </Link>
        </div>

        <div className="desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '15px', margin: 0, padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(e) => item.type === 'anchor' && handleScrollTo(e, item.id)}
                  style={{
                    fontSize: '11px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    color: item.id === 'agenda' ? '#38bdf8' : '#000', 
                    textDecoration: 'none', 
                    letterSpacing: '1px'
                  }}
                  className={item.id === 'agenda' ? 'agenda-attention' : ''}
                >
                  {item.id === 'carro' ? `CARRO (${cartCount})` : t(`landing.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/acceso?tab=cliente" style={{ fontSize: '11px', fontWeight: 900, color: '#fff', background: '#000', padding: '8px 14px', borderRadius: '4px', textDecoration: 'none' }}>ACCESO CLIENTES</Link>
            <Link href="/acceso?tab=colaborador" style={{ fontSize: '10px', fontWeight: 700, color: '#666', textDecoration: 'none' }}>COLABORADOR</Link>
          </div>
          <div className="lang-selector-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <div 
              className="lang-scroll-container"
              ref={scrollRef}
              onScroll={() => {
                if (scrollRef.current) {
                  const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                  const currentScroll = scrollRef.current.scrollLeft;
                  setScrollVal((currentScroll / maxScroll) * 100);
                }
              }}
              style={{ 
                display: 'flex', 
                gap: '6px', 
                overflowX: 'auto', 
                maxWidth: '220px',
                padding: '4px 0',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth'
              }}
            >
              {LANGUAGES.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => changeLang(l.code)} 
                  style={{ 
                    background: lang === l.code ? '#000' : 'none', 
                    color: lang === l.code ? '#fff' : '#000', 
                    border: '1px solid #000', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    padding: '4px 10px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {l.name}
                </button>
              ))}
            </div>
            {/* Custom Premium Slider */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={scrollVal || 0}
              onChange={(e) => {
                const val = e.target.value;
                setScrollVal(val);
                if (scrollRef.current) {
                  const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                  scrollRef.current.scrollLeft = (val / 100) * maxScroll;
                }
              }}
              style={{
                width: '80%',
                height: '2px',
                appearance: 'none',
                background: '#ddd',
                outline: 'none',
                cursor: 'pointer',
                borderRadius: '2px'
              }}
              className="lang-slider"
            />
          </div>
        </div>
      </nav>

      {/* MOBILE FLYOUT */}
      {menuOpen && (
        <div className="mobile-flyout-overlay">
          <Image src="/logo-wave.png" alt="Logo" width={50} height={50} className="logo-pulsing" style={{ filter: 'invert(1)' }} />
          
          <div className="flyout-links">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.type === 'anchor') {
                    handleScrollTo(e, item.id);
                  } else {
                    setMenuOpen(false);
                  }
                }}
                className={item.id === 'agenda' ? 'agenda-attention' : ''}
                style={item.id === 'agenda' ? { color: '#38bdf8' } : {}}
                target={item.id === 'carro' ? '_blank' : undefined}
                rel={item.id === 'carro' ? 'noopener noreferrer' : undefined}
              >
                {item.id === 'carro' ? t('landing.menu_carro').replace('(0)', `(${cartCount})`) : t(`landing.${item.key}`)}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <Link href="/acceso?tab=cliente" onClick={() => setMenuOpen(false)} style={{ background: '#fff', color: '#000', padding: '16px', textAlign: 'center', borderRadius: '8px', fontWeight: 900, textDecoration: 'none', fontSize: '14px' }}>
                 ACCESO CLIENTES
               </Link>
               <Link href="/acceso?tab=colaborador" onClick={() => setMenuOpen(false)} style={{ background: 'transparent', color: '#666', padding: '10px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '12px' }}>
                 ACCESO COLABORADOR
               </Link>
             </div>
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(4, 1fr)', 
               gap: '8px',
               marginTop: '10px'
             }}>
                {LANGUAGES.map(l => (
                  <button 
                    key={l.code} 
                    onClick={() => { changeLang(l.code); setMenuOpen(false); }} 
                    style={{ 
                      background: lang === l.code ? '#38bdf8' : 'none', 
                      color: '#fff', 
                      border: '1px solid rgba(255,255,255,0.3)', 
                      borderRadius: '4px', 
                      padding: '10px 4px', 
                      fontWeight: 900,
                      fontSize: '12px'
                    }}
                  >
                    {l.name}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
}
