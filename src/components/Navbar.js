'use client';

import './Navbar.css';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Globe,
  ShoppingBag,
  ChevronDown,
  User,
  ShieldCheck,
  Check,
  MessageCircle,
  Phone,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useCart } from '@/lib/cart-context';

export default function Navbar() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartCount = safeCartItems.length;
  const { lang, changeLang, t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef(null);

  const LANGUAGES = [
    { code: 'es', name: 'Español (ES)' },
    { code: 'en', name: 'English (EN)' },
    { code: 'pt', name: 'Português (PT)' },
    { code: 'fr', name: 'Français (FR)' },
    { code: 'de', name: 'Deutsch (DE)' },
  ];

  // Auto-close mobile drawer & dropdown on route change (prevents stuck nav bugs)
  useEffect(() => {
    setMenuOpen(false);
    setLangDropdownOpen(false);
    document.body.style.overflow = '';
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { id: 'inicio', key: 'menu_inicio', text: 'Inicio', href: '/' },
    { id: 'escuelas', key: 'menu_escuelas', text: 'Escuelas', href: '/escuelas' },
    { id: 'taller', key: 'menu_taller', text: 'Taller', href: '/taller' },
    { id: 'equipo', key: 'menu_equipo', text: 'Equipo', href: '/equipo' },
    { id: 'riders', key: 'menu_riders', text: 'Riders', href: '/riders' },
    { id: 'tienda', key: 'menu_tienda', text: 'Tienda', href: '/tienda' },
    { id: 'eventos', key: 'menu_eventos', text: 'Eventos', href: '/eventos' },
    { id: 'contacto', key: 'menu_contacto', text: 'Contacto', href: '/contacto' },
  ];

  return (
    <>
      <header className={`vc-header-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
        {/* BARRA SUPERIOR — CONTRASTE B&W */}
        <div className="vc-top-bar">
          <div className="vc-top-bar-container">
            <p className="vc-top-bar-text">
              <span className="vc-pulse-dot" />
              <span className="vc-top-badge">20% OFF</span>
              <span>ESTUDIANTES Y EXTRANJEROS EN RESERVAS ONLINE · SINCE 2015</span>
              <span className="vc-divider-slash">/</span>
              <Link href="/agenda" className="vc-top-bar-link">
                AGENDA TU CLASE &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* BARRA PRINCIPAL — FONDO NEGRO PURO + CÁPSULA GLASS OSCURA CON TÍTULOS BLANCOS */}
        <div className="vc-main-nav">
          <div className="vc-nav-container">
            {/* LEFT: BRAND ON BLACK */}
            <div className="vc-nav-left">
              <Link href="/" className="vc-brand-group" onClick={() => setMenuOpen(false)}>
                <div className="vc-logo-wrapper">
                  <Image
                    src="/logo-wave.png"
                    alt="Wave Surf Club"
                    width={40}
                    height={40}
                    priority
                    className="vc-logo-img"
                  />
                </div>
                <div className="vc-brand-text">
                  <span className="vc-brand-title">WAVE SURF CLUB<sup className="vc-reg">®</sup></span>
                  <span className="vc-brand-subtitle">CONCÓN · PICHILEMU · CHILE</span>
                </div>
              </Link>
            </div>

            {/* CENTER: VISION CODE DARK GLASS CAPSULE WITH CRISP WHITE ACTIVE PILL */}
            <nav className="vc-desktop-pill-nav" aria-label="Navegación principal">
              <div className="vc-pill-container">
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      className={`vc-nav-pill-link ${isActive ? 'is-active' : ''}`}
                    >
                      {t(`landing.${link.key}`) || link.text}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* RIGHT: MONOCHROME ACTIONS ON BLACK + WHITE CTA PILL WITH BLACK TEXT */}
            <div className="vc-nav-right">
              <Link href="/cart" className="vc-icon-action-btn" aria-label="Bolsa de compras" title="Bolsa">
                <ShoppingBag size={15} />
                {cartCount > 0 && <span className="vc-badge-count">{cartCount}</span>}
              </Link>

              <Link
                href="/acceso?tab=colaborador"
                className="vc-icon-action-btn"
                aria-label="Portal ERP y Staff"
                title="Portal ERP / Staff"
              >
                <ShieldCheck size={15} />
                <span className="vc-action-tooltip">Portal ERP</span>
              </Link>

              <div className="vc-lang-wrapper" ref={langRef}>
                <button
                  type="button"
                  className="vc-lang-trigger"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  aria-label="Cambiar idioma"
                >
                  <Globe size={13} />
                  <span>{lang.toUpperCase()}</span>
                  <ChevronDown size={11} className={langDropdownOpen ? 'vc-rot' : ''} />
                </button>

                {langDropdownOpen && (
                  <div className="vc-lang-menu">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className={`vc-lang-item ${lang === l.code ? 'is-selected' : ''}`}
                        onClick={() => {
                          changeLang(l.code);
                          setLangDropdownOpen(false);
                        }}
                      >
                        <span>{l.name}</span>
                        {lang === l.code && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/agenda" className="vc-cta-luxury-btn">
                <span className="vc-cta-dot" />
                <span>RESERVAR</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* MOBILE CONTROLS */}
            <div className="vc-mobile-controls">
              <Link href="/cart" className="vc-icon-action-btn" aria-label="Carrito">
                <ShoppingBag size={17} />
                {cartCount > 0 && <span className="vc-badge-count">{cartCount}</span>}
              </Link>
              <button
                type="button"
                className="vc-hamburger-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER — CRISP SOLID BLACK WITH WHITE TEXT */}
        <div className={`vc-mobile-drawer ${menuOpen ? 'is-open' : ''}`}>
          <div className="vc-mobile-drawer-inner">
            <Link
              href="/agenda"
              onClick={() => setMenuOpen(false)}
              className="vc-mobile-promo-card"
            >
              <div className="vc-mobile-promo-left">
                <span className="vc-promo-dot" />
                <span className="vc-mobile-promo-text">AGENDA TU CLASE</span>
                <span className="vc-promo-tag">20% OFF</span>
              </div>
              <ArrowUpRight size={18} />
            </Link>

            <div className="vc-mobile-links-list">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`vc-mobile-link-item ${isActive ? 'is-active' : ''}`}
                  >
                    <span>{t(`landing.${link.key}`) || link.text}</span>
                    <ArrowRight size={14} className="vc-arrow-muted" />
                  </Link>
                );
              })}
              <Link
                href="/servicios"
                onClick={() => setMenuOpen(false)}
                className={`vc-mobile-link-item ${pathname === '/servicios' ? 'is-active' : ''}`}
              >
                <span>Servicios</span>
                <ArrowRight size={14} className="vc-arrow-muted" />
              </Link>
              <Link
                href="/biografia"
                onClick={() => setMenuOpen(false)}
                className={`vc-mobile-link-item ${pathname === '/biografia' ? 'is-active' : ''}`}
              >
                <span>Biografía</span>
                <ArrowRight size={14} className="vc-arrow-muted" />
              </Link>
            </div>

            <div className="vc-mobile-divider" />

            <div className="vc-mobile-portal-grid">
              <Link
                href="/acceso?tab=cliente"
                onClick={() => setMenuOpen(false)}
                className="vc-mobile-portal-btn"
              >
                <User size={14} />
                <span>Acceso Alumnos</span>
              </Link>
              <Link
                href="/acceso?tab=colaborador"
                onClick={() => setMenuOpen(false)}
                className="vc-mobile-portal-btn vc-portal-staff"
              >
                <ShieldCheck size={14} />
                <span>Portal ERP</span>
              </Link>
            </div>

            <div className="vc-mobile-contact-row">
              <a
                href="https://wa.me/56975803044"
                target="_blank"
                rel="noopener noreferrer"
                className="vc-mobile-contact-pill"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Concón</span>
              </a>
              <a href="tel:+56975803044" className="vc-mobile-contact-pill">
                <Phone size={14} />
                <span>+56 9 7580 3044</span>
              </a>
            </div>

            <div className="vc-mobile-lang-row">
              <span className="vc-mobile-lang-label">IDIOMA</span>
              <div className="vc-mobile-lang-chips">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`vc-lang-chip ${lang === l.code ? 'is-active' : ''}`}
                    onClick={() => {
                      changeLang(l.code);
                      setMenuOpen(false);
                    }}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
