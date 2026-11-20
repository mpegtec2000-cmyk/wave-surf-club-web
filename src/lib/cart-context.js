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
        const json = JSON.stringify(cartItems);
        localStorage.setItem('wave_cart', json);
      } catch (e) {
        console.error("CRITICAL: Failed to save cart to localStorage", e);
      }
    }
  }, [cartItems]);

  const cleanItem = (item) => {
    if (!item) return null;
    const itemName = item.name || item.nombre || 'Producto Wave Surf Club';
    const itemPrice = Number(item.price_final || item.precio_final || item.price || item.precio || 0);
    const itemCategory = item.category || item.categoria || 'General';
    const itemImage = item.imagen_url || item.image || item.img || '/logo-wave.png';

    return {
      id: item.id || Date.now(),
      name: itemName,
      nombre: itemName,
      price: itemPrice,
      precio: itemPrice,
      precio_final: itemPrice,
      price_final: itemPrice,
      category: itemCategory,
      categoria: itemCategory,
      imagen_url: itemImage,
      requiere_reserva: !!item.requiere_reserva,
      cartItemId: item.cartItemId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      metadata: item.metadata || null,
      reserva: item.reserva ? {
        fecha: String(item.reserva.fecha || ''),
        hora_inicio: String(item.reserva.hora_inicio || ''),
        hora_fin: String(item.reserva.hora_fin || '')
      } : (item.metadata?.date ? {
        fecha: String(item.metadata.date || ''),
        hora_inicio: String(item.metadata.time || ''),
        hora_fin: ''
      } : null)
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
    return items.reduce((sum, item) => sum + (Number(item?.price || item?.precio_final || item?.precio) || 0), 0);
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
