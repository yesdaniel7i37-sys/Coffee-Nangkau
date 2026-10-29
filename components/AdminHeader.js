import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminHeader({ active }) {
  const tab = (href, label, key) => (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active === key ? "bg-amber-600 text-white" : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Panel <span className="text-amber-600">Admin</span>
          </h1>
          <p className="text-gray-400 text-sm">Kelola pesanan Coffee Nangkau</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-300 hover:text-amber-600 transition">Lihat website</Link>
          <form action={logout}>
            <button className="text-sm border border-neutral-700 hover:border-amber-600 hover:text-amber-600 px-4 py-2 rounded-lg transition">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <nav className="flex gap-2 mb-8" aria-label="Bagian admin">
        {tab("/admin", "Pesanan", "pesanan")}
        {tab("/admin/menu", "Menu", "menu")}
      </nav>
    </>
  );
}
