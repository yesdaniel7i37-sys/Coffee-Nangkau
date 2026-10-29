"use client";
import { useState } from "react";
import { FiX, FiCheck, FiCreditCard, FiSmartphone, FiDollarSign } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { rupiah } from "@/lib/format";
import { SERVICE_LABEL } from "@/lib/service";

const methods = [
  { id: "bank", label: "Transfer Bank", sub: "BCA, BNI, Mandiri", Icon: FiCreditCard },
  { id: "ewallet", label: "E-Wallet", sub: "GoPay, OVO, Dana, ShopeePay", Icon: FiSmartphone },
  { id: "cod", label: "Bayar di Kasir", sub: "Tunai, saat mengambil atau selesai makan", Icon: FiDollarSign },
];

const inputCls = "w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition";
const empty = { name: "", notes: "" };

export default function PaymentModal() {
  const {
    cart, total, paymentOpen, setPaymentOpen, setCartOpen, clearCart,
    serviceType, tableNumber, serviceReady, resetService,
  } = useApp();
  const [form, setForm] = useState(empty);
  const [method, setMethod] = useState("");
  const [done, setDone] = useState(null); // data pesanan yang berhasil dibuat
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setError("");
  };

  const submit = async () => {
    if (!serviceReady) return setError("Pilih makan di tempat (beserta nomor meja) atau take away di keranjang.");
    if (!form.name.trim()) return setError("Mohon isi nama Anda.");
    if (!method) return setError("Pilih metode pembayaran terlebih dahulu.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          serviceType,
          tableNumber,
          method,
          items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Pesanan gagal dikirim. Coba lagi.");
      setDone({ orderNumber: data.orderNumber, serviceType, tableNumber });
      setPaymentOpen(false);
      clearCart();
      resetService();
      setForm(empty);
      setMethod("");
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {paymentOpen && (
        <div onClick={(e) => e.target === e.currentTarget && setPaymentOpen(false)} className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4 modal-overlay">
          <div className="bg-neutral-800 rounded-2xl max-w-2xl w-full border border-neutral-700 modal-content max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-700 sticky top-0 bg-neutral-800 z-10 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Checkout Pembayaran</h3>
              <button onClick={() => setPaymentOpen(false)} aria-label="Tutup" className="text-white hover:text-amber-600 transition"><FiX className="h-8 w-8" /></button>
            </div>

            <div className="p-6">
              <p className="mb-5 rounded-lg border border-amber-700 bg-amber-900/30 px-4 py-3 text-sm text-amber-300">
                Ini website demo untuk portofolio. Pesanan tidak diproses sungguhan dan tidak ada pembayaran yang diminta.
              </p>
              <h4 className="text-lg font-bold text-white mb-4">Ringkasan Pesanan</h4>
              <div className="space-y-2 bg-neutral-900 rounded-lg p-4 border border-neutral-700 max-h-48 overflow-y-auto">
                {cart.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{i.name} x{i.quantity}</span>
                    <span className="text-white font-medium">{rupiah(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-white font-bold text-xl">
                <span>Total:</span><span className="text-amber-600">{rupiah(total)}</span>
              </div>

              <div className="mt-4 mb-6 flex items-center justify-between gap-3 rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Layanan</p>
                  <p className="text-white font-medium">
                    {SERVICE_LABEL[serviceType] || "Belum dipilih"}
                    {serviceType === "DINE_IN" && tableNumber ? ` · Meja ${tableNumber}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPaymentOpen(false); setCartOpen(true); }}
                  className="text-amber-600 hover:text-amber-500 font-medium transition"
                >
                  Ubah
                </button>
              </div>

              <h4 className="text-lg font-bold text-white mb-4">Informasi Pelanggan</h4>
              <div className="space-y-4 mb-6">
                <div><label htmlFor="pay-name" className="block text-sm font-medium text-gray-300 mb-2">Nama *</label>
                  <input id="pay-name" value={form.name} onChange={set("name")} className={inputCls} placeholder="Masukkan nama Anda" /></div>
                <div><label htmlFor="pay-notes" className="block text-sm font-medium text-gray-300 mb-2">Catatan (Opsional)</label>
                  <textarea id="pay-notes" rows={2} value={form.notes} onChange={set("notes")} className={inputCls + " resize-none"} placeholder="Contoh: Tolong jangan pakai es" /></div>
              </div>

              <h4 className="text-lg font-bold text-white mb-4">Metode Pembayaran</h4>
              <div className="space-y-3 mb-6">
                {methods.map(({ id, label, sub, Icon }) => (
                  <button key={id} type="button" onClick={() => { setMethod(id); setError(""); }}
                    className={`w-full text-left flex items-center justify-between p-4 bg-neutral-900 border-2 rounded-lg transition hover:border-amber-600 ${method === id ? "border-amber-600" : "border-neutral-700"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center"><Icon className="h-6 w-6 text-amber-600" /></div>
                      <div><p className="font-medium text-white">{label}</p><p className="text-sm text-gray-400">{sub}</p></div>
                    </div>
                    {method === id && <FiCheck className="h-6 w-6 text-amber-600" />}
                  </button>
                ))}
              </div>

              {method === "bank" && (
                <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-700 text-sm space-y-2">
                  <h5 className="font-bold text-white mb-3">Informasi Transfer Bank</h5>
                  <div className="flex justify-between"><span className="text-gray-400">Bank BCA</span><span className="text-white font-mono">1234567890</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Atas Nama</span><span className="text-white">Coffee Nangkau</span></div>
                  <p className="text-amber-600 text-xs mt-2">* Rekening contoh (demo). Jangan transfer ke nomor ini</p>
                </div>
              )}
              {method === "ewallet" && (
                <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-700 text-sm space-y-2">
                  <h5 className="font-bold text-white mb-3">Informasi E-Wallet</h5>
                  <select className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-600">
                    {["GoPay", "OVO", "Dana", "ShopeePay"].map((w) => <option key={w}>{w} - 0812-3456-7890</option>)}
                  </select>
                  <p className="text-amber-600 text-xs mt-2">* Nomor contoh (demo). Tidak ada pembayaran sungguhan</p>
                </div>
              )}
              {method === "cod" && (
                <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
                  <h5 className="font-bold text-white mb-3">Bayar di Kasir</h5>
                  <p className="text-gray-400 text-sm">Pembayaran tunai dilakukan di kasir. Untuk makan di tempat, bayar setelah selesai; untuk take away, bayar saat mengambil pesanan.</p>
                </div>
              )}

              {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
              <button onClick={submit} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-4 rounded-lg transition text-lg">{loading ? "Memproses..." : "Konfirmasi Pembayaran"}</button>
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl max-w-md w-full border border-neutral-700 p-8 text-center modal-content">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><FiCheck className="h-10 w-10 text-white" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Pesanan Berhasil!</h3>
            <p className="text-gray-400 mb-6">
              {done.serviceType === "DINE_IN"
                ? `Pesanan Anda akan diantar ke Meja ${done.tableNumber}.`
                : "Pesanan Anda sedang disiapkan. Kami akan memanggil nama Anda saat siap diambil."}
            </p>
            <p className="text-sm text-gray-500 mb-6">No. Pesanan: <span className="text-amber-600 font-mono">{done.orderNumber}</span></p>
            <button onClick={() => setDone(null)} className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-lg transition">Kembali ke Menu</button>
          </div>
        </div>
      )}
    </>
  );
}
