import React, { createContext, useContext, useState, useCallback } from 'react';
import { productService } from '../services/productService';

const CartContext = createContext({
  cartCount: 0,
  refreshCartCount: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      const res = await productService.getCart();
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}; 