'use client';

import { useState } from 'react';
import { ShoppingCart, X, Trash2, ChevronRight, CreditCard } from 'lucide-react';

export default function Cart({ isOpen, onClose, items, onRemove }) {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-overlay">
      <div className="cart-panel">
        <header className="cart-header">
          <div className="cart-title">
            <ShoppingCart size={24} />
            <h2>BOLSA DE SELECCIÓN</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </header>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Tu bolsa está vacía.</p>
              <p className="sub">Selecciona un servicio para comenzar.</p>
            </div>
          ) : (
            items.map((item, id) => (
              <div key={id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                </div>
                <div className="item-price">
                  <span>${item.price.toLocaleString('es-CL')}</span>
                  <button onClick={() => onRemove(id)} className="remove-btn">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="cart-footer">
          <div className="total-row">
            <span>TOTAL ESTIMADO</span>
            <span className="total-amount">${total.toLocaleString('es-CL')}</span>
          </div>
          <p className="cart-note">Los precios finales pueden variar según disponibilidad de sede.</p>
          <button className="checkout-btn" disabled={items.length === 0}>
            AGENDAR Y PAGAR <CreditCard size={18} style={{marginLeft: '10px'}} />
          </button>
        </footer>
      </div>

      <style jsx>{`
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }

        .cart-panel {
          width: 100%;
          max-width: 450px;
          background: #0b1120;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideIn 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .cart-header {
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cart-title {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #fff;
        }

        .cart-title h2 {
          font-family: var(--font-archivo), sans-serif;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.3s;
        }
        .close-btn:hover { color: #fff; }

        .cart-items {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94a3b8;
        }
        .empty-cart .sub { font-size: 12px; margin-top: 10px; opacity: 0.5; }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .item-info h3 {
          font-family: var(--font-archivo), sans-serif;
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #fff;
          text-transform: uppercase;
        }
        .item-info p {
          font-size: 11px;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin: 0;
        }

        .item-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .item-price span {
          font-family: var(--font-mono), monospace;
          font-weight: 800;
          color: #fff;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        .remove-btn:hover { opacity: 1; }

        .cart-footer {
          padding: 40px 30px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .total-row span:first-child {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 2px;
        }

        .total-amount {
          font-size: 24px;
          font-weight: 900;
          color: #fff;
        }

        .cart-note {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 20px;
          font-style: italic;
        }

        .checkout-btn {
          width: 100%;
          height: 60px;
          background: #38bdf8;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-family: var(--font-archivo), sans-serif;
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .checkout-btn:hover:not(:disabled) {
          background: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3);
        }
        .checkout-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
