'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cart from '@/components/Cart';
import { ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ServiciosPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (service) => {
    setCartItems([...cartItems, service]);
    setCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  return (
    <div className="servicios-master">
      <style jsx>{`
        .servicios-master {
          min-height: 100vh;
          background: #0b1120;
          color: #f8fafc;
          font-family: var(--font-inter), sans-serif;
          overflow-x: hidden;
        }

        /* --- NAVBAR --- */

        .cart-trigger {
          background: #38bdf8;
          border: none;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: transform 0.3s;
        }
        .cart-trigger:hover { transform: scale(1.1); }
        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* --- SECCIÓN INMERSIVA --- */
        .service-section {
          position: relative;
          height: 110vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11, 17, 32, 0.3), rgba(11, 17, 32, 0.8));
          z-index: 2;
        }
        .content {
          position: relative;
          z-index: 3;
          max-width: 1000px;
          padding: 0 20px;
        }

        .label {
          font-family: var(--font-archivo), sans-serif;
          font-size: 12px;
          font-weight: 900;
          color: #38bdf8;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: inline-block;
        }
        .title {
          font-family: var(--font-archivo), sans-serif;
          font-size: clamp(48px, 10vw, 120px);
          font-weight: 900;
          line-height: 0.9;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: -4px;
        }
        .description {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: clamp(20px, 3vw, 28px);
          color: #ffffff;
          max-width: 800px;
          margin: 0 auto 40px;
          line-height: 1.4;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .btn-reserve {
          display: inline-block;
          background: #fff;
          color: #000;
          font-family: var(--font-archivo), sans-serif;
          font-size: 12px;
          font-weight: 900;
          padding: 20px 40px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .btn-reserve:hover {
          background: #38bdf8;
          color: #fff;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(56, 189, 248, 0.4);
        }

        /* --- STICKY LABEL --- */
        .master-label {
          position: fixed;
          bottom: 40px;
          right: 40px;
          z-index: 100;
          font-family: var(--font-archivo), sans-serif;
          font-size: 10px;
          opacity: 0.3;
          letter-spacing: 4px;
          writing-mode: vertical-rl;
          text-transform: uppercase;
        }
      `}</style>

      {/* CABECERA */}
      <Navbar cartCount={cartItems.length} onCartClick={() => setCartOpen(true)} />

      <div className="master-label">Servicios Wave Surf Club</div>

      <Cart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
        onRemove={removeFromCart} 
      />

      {/* SECCIÓN 1: CLASES DE SURF */}
      <section className="service-section">
        <div className="bg-wrapper">
          <Image src="/wave-light.jpeg" alt="Clases Surf" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="overlay" />
        <div className="content">
          <span className="label">Disciplina 01 / Agua</span>
          <h1 className="title">CLASES<br/>DE SURF</h1>
          <p className="description">
            Evoluciona en el agua con instructores del más alto nivel. Desde tus primeras remadas hasta perfeccionamiento técnico.
          </p>
          <button 
            onClick={() => addToCart({ name: 'CLASE DE SURF INDIVIDUAL', price: 35000, category: 'Agua' })} 
            className="btn-reserve"
          >
            Añadir a Bolsa — $35.000
          </button>
        </div>
      </section>

      {/* SECCIÓN 2: CLASES DE SKATE */}
      <section className="service-section">
        <div className="bg-wrapper">
          <Image src="/tomi-bock-fondo.png" alt="Skate" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="overlay" style={{ background: 'linear-gradient(to bottom, #0b1120, rgba(11, 17, 32, 0.4), #0b1120)' }} />
        <div className="content">
          <span className="label">Disciplina 02 / Tierra</span>
          <h1 className="title">SKATE<br/>TRAINING</h1>
          <p className="description">
            Entrenamiento en tierra firme para dominar el agua. Mejora tu equilibrio, técnica de giro y fluidez sobre la tabla.
          </p>
          <button 
            onClick={() => addToCart({ name: 'SESIÓN SKATE TRAINING', price: 20000, category: 'Tierra' })} 
            className="btn-reserve"
          >
            Añadir a Bolsa — $20.000
          </button>
        </div>
      </section>

      {/* SECCIÓN 3: ARRIENDO Y EQUIPAMIENTO */}
      <section className="service-section">
        <div className="bg-wrapper">
          <Image src="/hero-rider.jpeg" alt="Equipamiento" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="overlay" />
        <div className="content">
          <span className="label">Módulo 03 / Hardware</span>
          <h1 className="title">EQUIPO<br/>PREMIUM</h1>
          <p className="description">
            Contamos con el mejor equipamiento del mercado. Arriendo de trajes 4/3mm, tablas de alta gama y accesorios técnicos.
          </p>
          <button 
            onClick={() => addToCart({ name: 'ARRIENDO EQUIPO COMPLETO', price: 15000, category: 'Hardware' })} 
            className="btn-reserve"
          >
            Añadir a Bolsa — $15.000
          </button>
        </div>
      </section>

      {/* SECCIÓN 4: COFFEE & LIFESTYLE */}
      <section className="service-section" style={{ height: '100vh', background: '#0b1120' }}>
        <div className="content">
          <span className="label">Módulo 04 / Comunidad</span>
          <h1 className="title">COFFEE &<br/>CULTURA</h1>
          <p className="description">
            El punto de encuentro tras la sesión. Café de especialidad, snacks saludables y el mejor ambiente surfista de la zona.
          </p>
          <Link href="/" className="btn-reserve" style={{ background: 'transparent', border: '1px solid #fff', color: '#fff' }}>Volver al Inicio</Link>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '100px 0', opacity: 0.2, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '5px' }}>
        Wave Surf Club © 2026 — Excellence in Board Sports
      </footer>
    </div>
  );
}

