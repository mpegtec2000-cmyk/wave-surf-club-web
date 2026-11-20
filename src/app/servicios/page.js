'use client';

import './servicios.css';

import Link from 'next/link';
import Image from 'next/image';
import Cart from '@/components/Cart';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cart-context';
import { ArrowUpRight } from 'lucide-react';

export default function ServiciosPage() {
  const { cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart } = useCart();

  return (
    <div className="sv-root">
      <Navbar />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
      />

      {/* SECCIÓN 1: CLASES DE SURF */}
      <section className="sv-section">
        <div className="sv-bg">
          <video autoPlay loop muted playsInline preload="auto" className="sv-video">
            <source src="/videos/fondo-wave.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="sv-overlay" />
        <div className="sv-content">
          <span className="sv-label">01 / AGUA · INSTRUCTORES ISA</span>
          <h1 className="sv-title">CLASES DE SURF</h1>
          <p className="sv-desc">
            Evoluciona en el agua desde tus primeras remadas hasta perfeccionamiento técnico con equipo completo incluido.
          </p>
          <button
            type="button"
            onClick={() => {
              addToCart({ name: 'CLASE DE SURF INDIVIDUAL', price: 35000, category: 'Agua' });
              setIsCartOpen(true);
            }}
            className="sv-btn"
          >
            <span>AÑADIR A BOLSA — $35.000</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* SECCIÓN 2: SKATE TRAINING */}
      <section className="sv-section">
        <div className="sv-bg">
          <Image src="/TIENDA/IMG_5779.jpeg" alt="Skate" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="sv-overlay" />
        <div className="sv-content">
          <span className="sv-label">02 / TIERRA · MEGA RAMP PRO</span>
          <h2 className="sv-title">SKATE TRAINING</h2>
          <p className="sv-desc">
            Entrenamiento en tierra firme para dominar el mar. Mejora tu equilibrio, giros y fluidez sobre la tabla.
          </p>
          <button
            type="button"
            onClick={() => {
              addToCart({ name: 'SESIÓN SKATE TRAINING', price: 20000, category: 'Tierra' });
              setIsCartOpen(true);
            }}
            className="sv-btn"
          >
            <span>AÑADIR A BOLSA — $20.000</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* SECCIÓN 3: EQUIPAMIENTO */}
      <section className="sv-section">
        <div className="sv-bg">
          <Image src="/TIENDA/4.PNG" alt="Equipamiento" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="sv-overlay" />
        <div className="sv-content">
          <span className="sv-label">03 / HARDWARE · RENTAL</span>
          <h2 className="sv-title">EQUIPO PREMIUM</h2>
          <p className="sv-desc">
            Arriendo de trajes 4/3mm, tablas soft &amp; epoxy de alta gama y accesorios técnicos todo el año.
          </p>
          <button
            type="button"
            onClick={() => {
              addToCart({ name: 'ARRIENDO EQUIPO COMPLETO', price: 15000, category: 'Hardware' });
              setIsCartOpen(true);
            }}
            className="sv-btn"
          >
            <span>AÑADIR A BOLSA — $15.000</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* SECCIÓN 4: COFFEE & CULTURA (CRISP WHITE EDITORIAL) */}
      <section className="sv-section sv-light">
        <div className="sv-content sv-light-content">
          <span className="sv-label">04 / COMUNIDAD · PLAYA LA BOCA</span>
          <h2 className="sv-title">COFFEE &amp; CULTURA®</h2>
          <p className="sv-desc">
            El punto de encuentro tras la sesión. Café de especialidad, música, mirador frente a la ola y cultura surf.
          </p>
          <Link href="/agenda" className="sv-btn-black">
            <span>AGENDAR EXPERIENCIA</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="sv-footer">
        WAVE SURF CLUB® © 2026 — SURF &amp; SKATE CULTURE
      </footer>
    </div>
  );
}
