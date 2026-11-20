'use client';

import './home.css';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';
import { useCart } from '@/lib/cart-context';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  Check,
  Clock,
  Navigation
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { resolveProductImage } from '@/lib/product-images';

const CAROUSEL_IMAGES = [
  { src: '/TIENDA/1.PNG', title: 'SESIONES DE ALTO RENDIMIENTO', subtitle: '01 / PICHILEMU & CONCÓN' },
  { src: '/TIENDA/IMG_5779.jpeg', title: 'MEGA RAMP SKATE TRAINING', subtitle: '02 / TÉCNICA EN TIERRA FIRME' },
  { src: '/TIENDA/7.PNG', title: 'ESCUELA INTEGRAL DE SURF', subtitle: '03 / INICIACIÓN A PRO' },
  { src: '/TIENDA/3.PNG', title: 'COMUNIDAD WAVE SURF CLUB®', subtitle: '04 / OCEAN CULTURE SINCE 2015' },
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    nombre: 'Clase de Surf Personalizada',
    precio_final: 25000,
    precio: 30000,
    imagen_url: '/TIENDA/actualizacion/Clase%20personalizada%20de%20surf.png',
    destacado: true,
    categorias_tienda: { nombre: 'Clases' }
  },
  {
    id: 2,
    nombre: 'Arriendo Traje 4/3mm + Tabla Pro',
    precio_final: 15000,
    precio: 18000,
    imagen_url: '/TIENDA/actualizacion/Equipo%20completo%20de%20surf%20y%20olas.png',
    destacado: true,
    categorias_tienda: { nombre: 'Arriendos' }
  },
  {
    id: 3,
    nombre: 'Sesión Mega Ramp Skate Training',
    precio_final: 20000,
    precio: 25000,
    imagen_url: '/TIENDA/actualizacion/Arriendo%20de%20Tablas%20Wave%20Surf%20Club.png',
    destacado: true,
    categorias_tienda: { nombre: 'Skate' }
  },
  {
    id: 4,
    nombre: 'Pack 3 Clases: Surf, Bodyboard & Skate',
    precio_final: 50000,
    precio: 55000,
    imagen_url: '/TIENDA/actualizacion/Pack%20de%203%20clases_%20Surf%2C%20Bodyboard%20y%20Skate.png',
    destacado: true,
    categorias_tienda: { nombre: 'Packs' }
  }
];

export default function LandingPage() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productos, setProductos] = useState(FALLBACK_PRODUCTS);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchProductos();
    const heroTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4800);
    return () => clearInterval(heroTimer);
  }, []);

  const fetchProductos = async () => {
    try {
      const { data } = await supabase
        .from('productos_tienda')
        .select('id, nombre, precio, precio_final, imagen_url, destacado, categorias_tienda(nombre, slug)')
        .eq('activo', true)
        .eq('destacado', true)
        .limit(8);
      if (data && data.length > 0) {
        setProductos(data.map((p) => ({ ...p, imagen_url: resolveProductImage(p) })));
      }
    } catch {
      // Fallback local catalog stays active
    }
  };

  const handleQuickAdd = (prod) => {
    addToCart({
      id: prod.id,
      nombre: prod.nombre,
      precio_final: prod.precio_final,
      imagen_url: prod.imagen_url,
      category: prod.categorias_tienda?.nombre || 'Tienda'
    });
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  return (
    <div className="wsc-home-root">
      <Navbar />

      <main className="wsc-home-main">
        {/* HERO SECTION — VIDEO DE EQUIPO (/videos/fondo-wave.mp4) + ESTÉTICA EDITORIAL JUVENIL B&W */}
        <section id="hero" className="wsc-hero editorial-grain">
          <div className="wsc-hero-video-wrap">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="wsc-hero-video"
            >
              <source src="/videos/fondo-wave.mp4" type="video/mp4" />
            </video>
            <div className="wsc-hero-vignette" />
          </div>

          {/* EDITORIAL CORNER METADATA + LOWER THIRD POSTER LAYOUT (LEAVES BARREL & VIDEO LOGO UNOBSTRUCTED) */}
          <div className="wsc-hero-editorial">
            <div className="wsc-hero-meta-bar">
              <span>32°55&apos;S 71°31&apos;W · CHILE</span>
              <span className="wsc-star">✦</span>
              <span>CONCÓN · PICHILEMU · PUNTA DE PIEDRA</span>
              <span className="wsc-star">✦</span>
              <span>OPEN 08:00 — 22:00</span>
            </div>

            <div className="wsc-hero-bottom-grid">
              <div className="wsc-hero-headline-col">
                <span className="wsc-hero-kicker">SURF &amp; SKATE VISUAL CULTURE · EST. 2015</span>
                <h1 className="wsc-hero-title">
                  CULTURA DE MAR<sup className="wsc-hero-reg">®</sup>
                </h1>
              </div>

              <div className="wsc-hero-cta-col">
                <p className="wsc-hero-copy">
                  Escuela de surf, Mega Ramp skate y taller de shaping sustentable en las olas más icónicas de Chile. Sin filtros, pura técnica y comunidad.
                </p>
                <div className="wsc-hero-btns">
                  <Link href="/agenda" className="wsc-btn-white">
                    <span>AGENDA TU CLASE</span>
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link href="/riders" className="wsc-btn-outline">
                    <span>CONOCE A LOS RIDERS</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YOUTH EDITORIAL MARQUEE STRIP (STARK WHITE ON BLACK CONTRAST) */}
        <div className="wsc-marquee-strip" aria-hidden="true">
          <div className="wsc-marquee-track">
            <span>WAVE SURF CLUB®</span>
            <span>✦</span>
            <span>CONCÓN · PLAYA LA BOCA</span>
            <span>✦</span>
            <span>PICHILEMU · TALLER AGAVE</span>
            <span>✦</span>
            <span>PUNTA DE PIEDRA</span>
            <span>✦</span>
            <span>MEGA RAMP PRO</span>
            <span>✦</span>
            <span>20% OFF ESTUDIANTES &amp; EXTRANJEROS</span>
            <span>✦</span>
            <span>WAVE SURF CLUB®</span>
            <span>✦</span>
            <span>CONCÓN · PLAYA LA BOCA</span>
            <span>✦</span>
            <span>PICHILEMU · TALLER AGAVE</span>
            <span>✦</span>
            <span>PUNTA DE PIEDRA</span>
            <span>✦</span>
            <span>MEGA RAMP PRO</span>
            <span>✦</span>
            <span>20% OFF ESTUDIANTES &amp; EXTRANJEROS</span>
            <span>✦</span>
          </div>
        </div>

        {/* ABOUT US — SOMOS WAVE SURF CLUB® */}
        <section className="wsc-section wsc-about">
          <div className="wsc-container">
            <div className="wsc-editorial-header">
              <span className="wsc-mono-tag">01 / MANIFIESTO &amp; SEDES</span>
              <h2 className="wsc-display-h2">SOMOS WAVE SURF CLUB®</h2>
            </div>

            <div className="wsc-about-grid">
              <div className="wsc-about-left">
                <p className="wsc-about-lead">
                  Nacimos en 2015 en Playa La Boca con una obsesión clara: unir técnica real de surf, skate en Mega Ramp y respeto absoluto por el Pacífico. Hoy lideramos una cultura de tabla auténtica a lo largo de la costa chilena.
                </p>

                <div className="wsc-sedes-stack">
                  <Link href="/spots/concon" className="wsc-sede-card">
                    <span className="wsc-sede-num">01</span>
                    <div className="wsc-sede-info">
                      <h4>CONCÓN · PLAYA LA BOCA</h4>
                      <p>Sede matriz con Mega Ramp Pro, camarines, duchas calientes y mirador frente a la rompiente.</p>
                    </div>
                    <ArrowUpRight size={18} className="wsc-sede-arrow" />
                  </Link>

                  <Link href="/taller" className="wsc-sede-card">
                    <span className="wsc-sede-num">02</span>
                    <div className="wsc-sede-info">
                      <h4>PICHILEMU · CAPITAL DEL SURF</h4>
                      <p>Olas de clase mundial, base técnica y taller de shaping sustentable en madera de Agave.</p>
                    </div>
                    <ArrowUpRight size={18} className="wsc-sede-arrow" />
                  </Link>

                  <Link href="/spots/punta-piedra" className="wsc-sede-card">
                    <span className="wsc-sede-num">03</span>
                    <div className="wsc-sede-info">
                      <h4>PUNTA DE PIEDRA · HIGH PERFORMANCE</h4>
                      <p>Spot exclusivo para clases personalizadas, video-análisis y arquitectura 360° frente al mar.</p>
                    </div>
                    <ArrowUpRight size={18} className="wsc-sede-arrow" />
                  </Link>
                </div>

                <div className="wsc-about-actions">
                  <Link href="/escuelas" className="wsc-btn-white">
                    <span>EXPLORAR ESCUELAS</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/biografia" className="wsc-btn-outline">
                    <span>NUESTRA HISTORIA</span>
                  </Link>
                </div>
              </div>

              <div className="wsc-about-right">
                <div className="wsc-editorial-photo">
                  <Image
                    src="/Sunny%20Wave%20Surf%20Club%20Beach%20Shop.png"
                    alt="Sunny Wave Surf Club Beach Shop"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 600px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className="wsc-stats-dock">
                  <div className="wsc-stat-cell">
                    <strong>10+</strong>
                    <span>AÑOS</span>
                  </div>
                  <div className="wsc-stat-divider" />
                  <div className="wsc-stat-cell">
                    <strong>+5K</strong>
                    <span>ALUMNOS</span>
                  </div>
                  <div className="wsc-stat-divider" />
                  <div className="wsc-stat-cell">
                    <strong>03</strong>
                    <span>SEDES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAPA — ESCUELA PRINCIPAL (CONCÓN · PLAYA LA BOCA) */}
        <section className="wsc-section wsc-map-section">
          <div className="wsc-container">
            <div className="wsc-editorial-header-row">
              <div>
                <span className="wsc-mono-tag">UBICACIÓN · SEDE MATRIZ</span>
                <h2 className="wsc-display-h2">NUESTRA ESCUELA PRINCIPAL</h2>
              </div>
              <div className="wsc-map-header-actions">
                <div className="wsc-map-tag">
                  <MapPin size={14} />
                  <span>Playa La Boca, Concón · Chile</span>
                </div>
                <a
                  href="https://www.google.com/maps/place/Wave+Surf+Club/@-32.9192933,-71.513455,17z/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wsc-text-link"
                >
                  <span>CÓMO LLEGAR</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="wsc-map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.5727488751654!2d-71.51345498833355!3d-32.91929327349388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689c33e4487d31d%3A0x8fc83b8de496ce1f!2sWave%20Surf%20Club!5e1!3m2!1ses-419!2scl!4v1795134887112!5m2!1ses-419!2scl"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Ubicación Wave Surf Club Concón - Sede Principal"
              />
            </div>

            <div className="wsc-map-info-bar">
              <div className="wsc-map-info-card">
                <div className="wsc-map-info-icon">
                  <MapPin size={18} />
                </div>
                <div className="wsc-map-info-text">
                  <strong>PUNTO DE ENCUENTRO</strong>
                  <p>Playa La Boca, Concón. Frente a la rompiente y al lado de la desembocadura.</p>
                </div>
              </div>

              <div className="wsc-map-info-card">
                <div className="wsc-map-info-icon">
                  <Clock size={18} />
                </div>
                <div className="wsc-map-info-text">
                  <strong>HORARIO CONTINUADO</strong>
                  <p>Lunes a Domingo de 08:00 a 22:00 hrs. Clases, arriendos y cafetería abiertos.</p>
                </div>
              </div>

              <div className="wsc-map-info-card">
                <div className="wsc-map-info-icon">
                  <Navigation size={18} />
                </div>
                <div className="wsc-map-info-text">
                  <strong>INSTALACIONES CLAVE</strong>
                  <p>Mega Ramp Pro, camarines, duchas calientes y mirador con vista 360° al Pacífico.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CINEMATIC CAROUSEL — VIDA EN EL AGUA */}
        <section className="wsc-section wsc-gallery">
          <div className="wsc-container">
            <div className="wsc-editorial-header-row">
              <div>
                <span className="wsc-mono-tag">02 / ARCHIVO VISUAL</span>
                <h2 className="wsc-display-h2">VIDA EN EL AGUA</h2>
              </div>
              <div className="wsc-carousel-controls-top">
                <button type="button" className="wsc-circle-btn" onClick={prevSlide} aria-label="Anterior">
                  <ChevronLeft size={20} />
                </button>
                <button type="button" className="wsc-circle-btn" onClick={nextSlide} aria-label="Siguiente">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="wsc-carousel-frame">
              <div className="wsc-carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {CAROUSEL_IMAGES.map((img, index) => (
                  <div key={index} className="wsc-carousel-slide">
                    <Image
                      src={img.src}
                      alt={img.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      priority={index === 0}
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div className="wsc-slide-grad" />
                    <div className="wsc-slide-caption">
                      <span className="wsc-slide-kicker">{img.subtitle}</span>
                      <h3 className="wsc-slide-title">{img.title}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wsc-carousel-dots">
                {CAROUSEL_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`wsc-c-dot ${currentSlide === index ? 'is-active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WAVE SHOP — PRODUCTOS DESTACADOS (STARK B&W STREETWEAR GRID) */}
        <section className="wsc-section wsc-shop">
          <div className="wsc-container">
            <div className="wsc-editorial-header-row">
              <div>
                <span className="wsc-mono-tag">03 / WAVE SHOP &amp; SESIONES</span>
                <h2 className="wsc-display-h2">DESTACADOS</h2>
              </div>
              <Link href="/tienda" className="wsc-text-link">
                <span>VER CATÁLOGO COMPLETO</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="wsc-products-grid">
              {productos.map((prod) => (
                <article key={prod.id} className="wsc-prod-card">
                  <div className="wsc-prod-media">
                    {prod.imagen_url ? (
                      <Image
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className="wsc-prod-img"
                      />
                    ) : (
                      <div className="wsc-prod-empty">WAVE®</div>
                    )}
                  </div>

                  <div className="wsc-prod-body">
                    <span className="wsc-prod-badge">
                      {prod.categorias_tienda?.nombre || 'Drop'}
                    </span>
                    <h4>{prod.nombre}</h4>
                    <div className="wsc-prod-price-row">
                      <span className="wsc-prod-price">
                        ${(prod.precio_final || 0).toLocaleString('es-CL')}
                      </span>
                      {prod.precio && prod.precio > prod.precio_final && (
                        <span className="wsc-prod-old">
                          ${prod.precio.toLocaleString('es-CL')}
                        </span>
                      )}
                    </div>

                    <div className="wsc-prod-actions">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className={`wsc-prod-add ${addedId === prod.id ? 'is-added' : ''}`}
                      >
                        {addedId === prod.id ? (
                          <>
                            <Check size={14} />
                            <span>AGREGADO</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            <span>AÑADIR</span>
                          </>
                        )}
                      </button>
                      <Link href="/tienda" className="wsc-prod-view" aria-label={`Ver ${prod.nombre}`}>
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="wsc-center-cta">
              <Link href="/tienda" className="wsc-btn-white">
                <span>EXPLORAR TODA LA TIENDA</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* FLOATING WHATSAPP — PURE MONOCHROME B&W */}
        <a
          href="https://wa.me/56975803044"
          target="_blank"
          rel="noopener noreferrer"
          className="wsc-wa-float"
          aria-label="WhatsApp Wave Surf Club"
        >
          <MessageCircle size={22} />
          <span className="wsc-wa-tooltip">¿Dudas? Escríbenos por WhatsApp</span>
        </a>

        {/* MONOCHROME EDITORIAL FOOTER */}
        <footer className="wsc-footer">
          <div className="wsc-container">
            <div className="wsc-footer-grid">
              <div className="wsc-footer-brand-col">
                <div className="wsc-footer-logo">
                  <Image src="/logo-wave.png" alt="Wave Surf Club" width={44} height={44} />
                  <div>
                    <h3>WAVE SURF CLUB®</h3>
                    <span>SINCE 2015 · CHILE</span>
                  </div>
                </div>
                <p className="wsc-footer-desc">
                  Cultura de surf, skate pro y shaping sustentable frente al Pacífico. Escuela certificada ISA y comunidad abierta todo el año.
                </p>
                <div className="wsc-footer-socials">
                  <a href="https://www.instagram.com/wave_surf_club/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram size={17} />
                  </a>
                  <a href="https://wa.me/56975803044" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <Phone size={17} />
                  </a>
                  <a href="mailto:WAVE_SURF_CLUB@outlook.com" aria-label="Email">
                    <Mail size={17} />
                  </a>
                </div>
              </div>

              <div className="wsc-footer-col">
                <h4>SEDES</h4>
                <ul>
                  <li>
                    <MapPin size={13} />
                    <div>
                      <strong>Concón</strong>
                      <span>Playa La Boca · Mega Ramp</span>
                    </div>
                  </li>
                  <li>
                    <MapPin size={13} />
                    <div>
                      <strong>Pichilemu</strong>
                      <span>Punta de Lobos · Taller Agave</span>
                    </div>
                  </li>
                  <li>
                    <MapPin size={13} />
                    <div>
                      <strong>Punta de Piedra</strong>
                      <span>Quintero · High Performance</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="wsc-footer-col">
                <h4>NAVEGACIÓN</h4>
                <ul className="wsc-footer-nav">
                  <li><Link href="/escuelas">Escuelas</Link></li>
                  <li><Link href="/taller">Taller &amp; Shaping</Link></li>
                  <li><Link href="/equipo">Equipo</Link></li>
                  <li><Link href="/riders">Riders</Link></li>
                  <li><Link href="/tienda">Tienda Oficial</Link></li>
                  <li><Link href="/eventos">Eventos</Link></li>
                  <li><Link href="/servicios">Servicios</Link></li>
                  <li><Link href="/biografia">Biografía</Link></li>
                </ul>
              </div>

              <div className="wsc-footer-col">
                <h4>HORARIOS &amp; ACCESO</h4>
                <p className="wsc-footer-hours">
                  LUNES A DOMINGO<br />
                  <strong>08:00 AM — 22:00 PM</strong>
                </p>
                <div className="wsc-footer-portal-links">
                  <Link href="/agenda" className="wsc-footer-btn">AGENDAR CLASE &rarr;</Link>
                  <Link href="/acceso?tab=colaborador" className="wsc-footer-link-sm">Portal ERP / Colaboradores</Link>
                </div>
              </div>
            </div>

            <div className="wsc-footer-bottom">
              <span>© {new Date().getFullYear()} WAVE SURF CLUB® CHILE — TODOS LOS DERECHOS RESERVADOS</span>
              <span>CONCÓN · PICHILEMU · PUNTA DE PIEDRA</span>
            </div>
          </div>
        </footer>
      </main>

      {/* STRICTLY PREFIXED STYLES (.wsc-*) SO <Link> AND <Image> ALWAYS RECEIVE STYLES WITH ZERO BLEED */}
    </div>
  );
}
