"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

// Сагсны мэдээллийг app даяар түгээх context.

const CartContext = createContext(null);

// Reducer нь сагстай холбоотой бүх үйлдлийг нэг загвараар боловсруулна.
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + (action.qty ?? 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: action.qty ?? 1 }],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: Math.max(1, action.qty) } : i,
        ),
      };

    case "CLEAR":
      return { ...state, items: [] };

    case "HYDRATE":
      return { ...state, items: action.items };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Хуудас дахин ачаалагдсан ч өмнөх сагсыг localStorage-оос сэргээнэ.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura_cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aura_cart", JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = (item, qty = 1) => dispatch({ type: "ADD", item, qty });
  const removeItem = (id) => dispatch({ type: "REMOVE", id });
  const updateQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const clearCart = () => dispatch({ type: "CLEAR" });

  // UI дээр олон газар хэрэг болдог тооцооллыг provider дотроо бэлдэж өгч байна.
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  // Provider-оос гадуур дуудагдвал хөгжүүлэлтийн үед шууд анзаарагдахаар алдаа шиднэ.
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
