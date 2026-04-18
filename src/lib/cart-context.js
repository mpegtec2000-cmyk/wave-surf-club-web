'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wave_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          setCartItems([]);
        }
      }
    } catch (e) {
      console.error("Error loading cart", e);
      setCartItems([]);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Array.isArray(cartItems)) {
      try {
        // Use a safe stringify to avoid circular reference crashes
        const json = JSON.stringify(cartItems);
        localStorage.setItem('wave_cart', json);
      } catch (e) {
        console.error("CRITICAL: Failed to save cart to localStorage", e);
        // If it fails, don't crash the whole app, just log it.
      }
    }
  }, [cartItems]);

  const cleanItem = (item) => {
    if (!item) return null;
    // Strip possible circular refs or complex objects
    return {
      id: item.id,
      nombre: String(item.nombre || 'Producto'),
      precio: Number(item.precio || 0),
      precio_final: Number(item.precio_final || 0),
      imagen_url: item.imagen_url,
      requiere_reserva: !!item.requiere_reserva,
      cartItemId: item.cartItemId || Date.now(),
      reserva: item.reserva ? {
        fecha: String(item.reserva.fecha || ''),
        hora_inicio: String(item.reserva.hora_inicio || ''),
        hora_fin: String(item.reserva.hora_fin || '')
      } : null
    };
  };

  const addToCart = (item) => {
    if (!item) return;
    const newItem = cleanItem(item);
    if (!newItem) return;
    
    setCartItems(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return [...current, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter(item => item && item.cartItemId !== cartItemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((sum, item) => sum + (Number(item?.precio_final) || 0), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems: Array.isArray(cartItems) ? cartItems : [], 
      isCartOpen, 
      setIsCartOpen, 
      addToCart, 
      removeFromCart, 
      clearCart,
      getCartTotal,
      total: getCartTotal()
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      isCartOpen: false,
      setIsCartOpen: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      getCartTotal: () => 0,
      total: 0,
    };
  }
  return context;
}
