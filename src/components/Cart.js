'use client';

import './Cart.css';

import { ShoppingCart, X, Trash2, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function Cart({ isOpen, onClose, items, onRemove }) {
  if (!isOpen) return null;

  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((sum, item) => sum + Number(item.price ?? item.precio_final ?? 0), 0);

  return (
    <div className="wcart-overlay" onClick={onClose}>
      <div className="wcart-panel" onClick={(e) => e.stopPropagation()}>
        <header className="wcart-header">
          <div className="wcart-title">
            <ShoppingCart size={20} />
            <h2>BOLSA DE SELECCIÓN</h2>
          </div>
          <button type="button" onClick={onClose} className="wcart-close" aria-label="Cerrar bolsa">
            <X size={20} />
          </button>
        </header>

        <div className="wcart-items">
          {safeItems.length === 0 ? (
            <div className="wcart-empty">
              <p>Tu bolsa está vacía.</p>
              <span>Selecciona un servicio para comenzar.</span>
            </div>
          ) : (
            safeItems.map((item, idx) => (
              <div key={item.cartItemId || idx} className="wcart-item">
                <div className="wcart-info">
                  <h3>{item.name || item.nombre || 'Servicio Wave'}</h3>
                  <p>{item.category || item.categoria || 'Wave Surf Club'}</p>
                </div>
                <div className="wcart-right">
                  <span>${Number(item.price ?? item.precio_final ?? 0).toLocaleString('es-CL')}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.cartItemId)}
                    className="wcart-del"
                    aria-label="Eliminar ítem"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="wcart-footer">
          <div className="wcart-total-row">
            <span>TOTAL ESTIMADO</span>
            <strong>${total.toLocaleString('es-CL')}</strong>
          </div>
          <p className="wcart-note">Los precios finales pueden variar según disponibilidad de sede.</p>
          <Link href="/checkout" onClick={onClose} className={`wcart-checkout-btn ${safeItems.length === 0 ? 'disabled' : ''}`}>
            <span>AGENDAR Y PAGAR</span>
            <CreditCard size={16} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
