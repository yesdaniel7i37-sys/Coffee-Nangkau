"use client";
import { FiTrash2, FiX } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { rupiah } from "@/lib/format";
import { tables } from "@/lib/service";

const options = [
  { id: "DINE_IN", title: "Di Tempat", sub: "Makan/minum di sini" },
  { id: "TAKEAWAY", title: "Take Away", sub: "Bawa pulang" },
];

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, setPaymentOpen, changeQty, removeFromCart, total,
    serviceType, setServiceType, tableNumber, setTableNumber, serviceReady } = useApp();
  if (!cartOpen) return null;

  const checkout = () => {
    setCartOpen(false);
    setPaymentOpen(true);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-neutral-800 shadow-2xl z-50 border-l border-neutral-700 overflow-y-auto cart-sidebar">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Keranjang</h3>
          <button onClick={() => setCartOpen(false)} aria-label="Tutup keranjang" className="text-white hover:text-amber-600 transition"><FiX className="h-6 w-6" /></button>
        </div>

        <div className="space-y-4 mb-6">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Keranjang kosong</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{item.name}</h4>
                  <button onClick={() => removeFromCart(item.id)} aria-label={`Hapus ${item.name}`} className="text-red-500 hover:text-red-400"><FiTrash2 className="h-5 w-5" /></button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(item.id, -1)} aria-label={`Kurangi ${item.name}`} className="bg-neutral-800 hover:bg-neutral-700 text-white w-8 h-8 rounded transition">-</button>
                    <span className="text-white w-8 text-center">{item.quantity}</span>
                    <button onClick={() => changeQty(item.id, 1)} aria-label={`Tambah ${item.name}`} className="bg-neutral-800 hover:bg-neutral-700 text-white w-8 h-8 rounded transition">+</button>
                  </div>
                  <span className="text-amber-600 font-bold">{rupiah(item.price * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-neutral-700 pt-4 mb-4">
            <h4 className="text-white font-semibold mb-3">Pesan untuk</h4>
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={serviceType === o.id}
                  onClick={() => setServiceType(o.id)}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    serviceType === o.id ? "border-amber-600 bg-amber-600/10" : "border-neutral-700 hover:border-amber-600"
                  }`}
                >
                  <p className="text-white font-medium text-sm">{o.title}</p>
                  <p className="text-gray-400 text-xs">{o.sub}</p>
                </button>
              ))}
            </div>

            {serviceType === "DINE_IN" && (
              <div className="mt-4">
                <p className="text-sm text-gray-300 mb-2">Pilih nomor meja</p>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={tableNumber === n}
                      aria-label={`Meja ${n}`}
                      onClick={() => setTableNumber(n)}
                      className={`py-2 rounded-lg border text-sm font-medium transition ${
                        tableNumber === n
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "bg-neutral-900 border-neutral-700 text-gray-300 hover:border-amber-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {serviceType === "TAKEAWAY" && (
              <p className="mt-3 text-sm text-gray-400">Pesanan diambil di kasir setelah siap.</p>
            )}
          </div>
        )}

        <div className="border-t border-neutral-700 pt-4">
          <div className="flex justify-between text-white font-bold text-xl mb-6">
            <span>Total:</span><span className="text-amber-600">{rupiah(total)}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0 || !serviceReady} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-600">Checkout</button>
          {cart.length > 0 && !serviceReady && (
            <p className="mt-3 text-xs text-amber-500 text-center">
              {serviceType === "DINE_IN" ? "Pilih nomor meja untuk melanjutkan." : "Pilih makan di tempat atau take away untuk melanjutkan."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
