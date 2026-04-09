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

        /* --- CART TRIGGER --- */
        .cart-trigger {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          background: #38bdf8;
          border: none;
          color: #fff;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s, background 0.3s;
          box-shadow: 0 10px 25px rgba(56, 189, 248, 0.4);
        }
        .cart-trigger:hover { 
          transform: scale(1.1); 
          background: #0ea5e9;
        }
        .cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0b1120;
        }

        /* --- HERO --- */
        .hero {
          height: 60vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11, 17, 32, 0.4), #0b1120);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }
        .hero-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: 64px;
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 0.9;
          margin-bottom: 20px;
        }
        .hero-title span { color: #38bdf8; }
        .hero-sub {
          color: #94a3b8;
          font-size: 16px;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* --- GRID --- */
        .grid-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 100px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .service-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s;
          display: flex;
          flex-direction: column;
        }
        .service-card:hover {
          transform: translateY(-10px);
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .card-img {
          height: 240px;
          position: relative;
        }
        .card-body {
          padding: 30px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .card-tag {
          color: #38bdf8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .card-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 15px;
          color: #fff;
        }
        .card-desc {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .price {
          font-size: 22px;
          font-weight: 900;
          color: #fff;
        }
        .price span {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 400;
        }

        .btn-add {
          background: #38bdf8;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          transition: 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-add:hover {
          background: #fff;
          color: #0b1120;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .grid-container { grid-template-columns: 1fr; padding: 0 20px 60px; }
        }
      `}</style>

      <Navbar />

      <section className="hero">
        <div className="hero-img">
          <Image 
            src="/FONDO-BARRA.jpg" 
            alt="Servicios Hero" 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2 className="hero-sub font-black">Wave Surf Club</h2>
          <h1 className="hero-title">NUESTROS <span>SERVICIOS</span></h1>
        </div>
      </section>

      <div className="grid-container">
        {[
          { id: 1, tag: 'Formación', title: 'Clase Grupal', price: 25000, desc: 'Sesión de 90 minutos con instructores certificados. Incluye tabla, traje y teoría de seguridad.', img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80' },
          { id: 2, tag: 'Elite', title: 'Clase Particular', price: 45000, desc: 'Atención 1 a 1 para una evolución acelerada. Análisis técnico personalizado y corrección de maniobras.', img: 'https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?auto=format&fit=crop&w=800&q=80' },
          { id: 3, tag: 'Equipamiento', title: 'Arriendo Full Day', price: 20000, desc: 'Tabla de alto nivel y traje de primera calidad por todo el día. Disponible en todas nuestras sedes.', img: 'https://images.unsplash.com/photo-1459749411177-042180ec75c0?auto=format&fit=crop&w=800&q=80' },
          { id: 4, tag: 'Mantenimiento', title: 'Reparación Pro', price: 15000, desc: 'Desde pequeñas trizaduras hasta reconstrucciones mayores en nuestro taller especializado.', img: 'https://images.unsplash.com/photo-1531693251400-38df35776dc7?auto=format&fit=crop&w=800&q=80' },
          { id: 5, tag: 'Corporativo', title: 'Día de Empresa', price: 35000, desc: 'Programas de team building en el mar. Incluye catering, clases y registro audiovisual.', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },
          { id: 6, tag: 'Formación', title: 'Pack 4 Clases', price: 85000, desc: 'Plan mensual para dominar los fundamentos y entrar al lineup con confianza.', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }
        ].map(item => (
          <div key={item.id} className="service-card">
            <div className="card-img">
              <Image src={item.img} alt={item.title} fill className="object-cover" />
            </div>
            <div className="card-body">
              <span className="card-tag">{item.tag}</span>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
              <div className="card-footer">
                <div className="price">${item.price.toLocaleString()} <span>/ uni</span></div>
                <button className="btn-add" onClick={() => addToCart(item)}>Reservar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="cart-trigger" onClick={() => setCartOpen(true)}>
        <ShoppingBag size={24} />
        {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
      </button>

      {cartOpen && (
        <Cart 
          items={cartItems} 
          onClose={() => setCartOpen(false)} 
          onRemove={removeFromCart}
        />
      )}

      <footer style={{ padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px' }}>WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
