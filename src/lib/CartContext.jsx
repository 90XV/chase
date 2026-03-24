"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, selection = "ice") => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.selection === selection);
      if (existing) {
        return prev.map((item) =>
          (item.id === product.id && item.selection === selection) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selection }];
    });
  };

  const removeFromCart = (id, selection = "ice") => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id && item.selection === selection);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          (item.id === id && item.selection === selection) ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => !(item.id === id && item.selection === selection));
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
