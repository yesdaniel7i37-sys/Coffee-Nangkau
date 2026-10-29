"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { SERVICE_TYPES, isValidTable } from "@/lib/service";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [serviceType, setServiceTypeState] = useState(""); // "", "DINE_IN", "TAKEAWAY"
  const [tableNumber, setTableNumber] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Muat keranjang dan pilihan layanan yang tersimpan
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coffee-nangkau-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    try {
      const s = JSON.parse(localStorage.getItem("coffee-nangkau-service") || "null");
      if (s && SERVICE_TYPES.includes(s.serviceType)) {
        setServiceTypeState(s.serviceType);
        if (s.serviceType === "DINE_IN" && isValidTable(s.tableNumber)) setTableNumber(s.tableNumber);
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("coffee-nangkau-cart", JSON.stringify(cart));
      localStorage.setItem("coffee-nangkau-service", JSON.stringify({ serviceType, tableNumber }));
    } catch {}
  }, [cart, serviceType, tableNumber, hydrated]);

  const addToCart = (item) =>
    setCart((c) =>
      c.some((i) => i.id === item.id)
        ? c.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...c, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    );

  const changeQty = (id, delta) =>
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i)).filter((i) => i.quantity > 0)
    );

  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  // Pilih jenis layanan; nomor meja hanya berlaku untuk makan di tempat
  const setServiceType = (type) => {
    setServiceTypeState(type);
    if (type !== "DINE_IN") setTableNumber(null);
  };
  const resetService = () => {
    setServiceTypeState("");
    setTableNumber(null);
  };
  const serviceReady = serviceType === "TAKEAWAY" || (serviceType === "DINE_IN" && tableNumber !== null);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart, addToCart, changeQty, removeFromCart, clearCart, total, count,
        cartOpen, setCartOpen, paymentOpen, setPaymentOpen,
        searchOpen, setSearchOpen, query, setQuery,
        serviceType, setServiceType, tableNumber, setTableNumber, resetService, serviceReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
