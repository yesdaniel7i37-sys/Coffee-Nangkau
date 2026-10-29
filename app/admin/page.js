import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { STATUSES, getStats, listOrders } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { SERVICE_LABEL } from "@/lib/service";
import AdminHeader from "@/components/AdminHeader";
import { changeStatus, seedDemo } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  BARU: "bg-amber-600/20 text-amber-400 border-amber-600/40",
  DIPROSES: "bg-blue-600/20 text-blue-300 border-blue-600/40",
  SELESAI: "bg-green-600/20 text-green-400 border-green-600/40",
  DIBATALKAN: "bg-red-600/20 text-red-400 border-red-600/40",
};
const STATUS_LABEL = { BARU: "Baru", DIPROSES: "Diproses", SELESAI: "Selesai", DIBATALKAN: "Dibatalkan" };
const METHOD_LABEL = { bank: "Transfer Bank", ewallet: "E-Wallet", cod: "Bayar di Kasir" };

const formatDate = (iso) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function AdminPage({ searchParams }) {
  if (!(await getSession())) redirect("/admin/login");

  const { status } = await searchParams;
  const active = STATUSES.includes(status) ? status : "";
  const [orders, stats] = await Promise.all([listOrders(active), getStats()]);

  const cards = [
    ["Total Pesanan", stats.total],
    ["Pesanan Baru", stats.baru],
    ["Sedang Diproses", stats.diproses],
    ["Pendapatan", rupiah(stats.revenue)],
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <AdminHeader active="pesanan" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-amber-600">{value}</p>
          </div>
        ))}
      </section>

      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filter status">
        {[["", "Semua"], ...STATUSES.map((s) => [s, STATUS_LABEL[s]])].map(([value, label]) => (
          <Link
            key={value || "all"}
            href={value ? `/admin?status=${value}` : "/admin"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              active === value ? "bg-amber-600 text-white" : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-10 text-center">
          <p className="text-gray-300 mb-1">
            {active ? "Tidak ada pesanan dengan status ini." : "Belum ada pesanan."}
          </p>
          {!active && (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Pesanan dari halaman Menu akan muncul di sini. Untuk mencoba tampilannya, isi dengan data contoh.
              </p>
              <form action={seedDemo}>
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-3 rounded-lg transition">
                  Isi data contoh
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono font-bold text-lg">{o.orderNumber}</p>
                  <p className="text-gray-400 text-sm">{formatDate(o.createdAt)}</p>
                </div>
                <span className={`border text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 mb-1">Pelanggan</p>
                  <p className="font-medium">{o.customerName}</p>
                  {o.phone && <p className="text-gray-400">{o.phone}</p>}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Layanan</p>
                  {o.serviceType === "DINE_IN" ? (
                    <>
                      <p className="text-amber-500 font-bold text-lg">Meja {o.tableNumber}</p>
                      <p className="text-gray-400">{SERVICE_LABEL.DINE_IN}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-amber-500 font-bold text-lg">Take Away</p>
                      <p className="text-gray-400">Diambil di kasir</p>
                    </>
                  )}
                  {o.address && <p className="text-gray-500 mt-1">Alamat: {o.address}</p>}
                  {o.notes && <p className="text-gray-500 mt-1">Catatan: {o.notes}</p>}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Pembayaran</p>
                  <p className="text-gray-300">{METHOD_LABEL[o.paymentMethod] || o.paymentMethod}</p>
                  <p className="text-amber-600 font-bold text-lg">{rupiah(o.total)}</p>
                </div>
              </div>

              <details suppressHydrationWarning className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-amber-600 transition">
                  Lihat {o.items.length} item
                </summary>
                <ul className="mt-3 space-y-1 text-sm bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-gray-300">{i.name} x{i.quantity}</span>
                      <span>{rupiah(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <form action={changeStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <label htmlFor={`status-${o.id}`} className="sr-only">Ubah status {o.orderNumber}</label>
                <select
                  id={`status-${o.id}`}
                  name="status"
                  defaultValue={o.status}
                  className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                  Simpan
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
