import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listMenuAdmin } from "@/lib/db";
import { categories } from "@/data/menu";
import { rupiah } from "@/lib/format";
import AdminHeader from "@/components/AdminHeader";
import MenuImage from "@/components/MenuImage";
import { createMenu, saveMenu, toggleSoldOut } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Menu" };

const input =
  "w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition text-sm";
const label = "block text-xs font-medium text-gray-400 mb-1";
const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

function Fields({ prefix, m, k }) {
  return (
    <>
      <input type="hidden" name="k" value={k} />
      {m && <input type="hidden" name="id" value={m.id} />}
      <div>
        <label htmlFor={`${prefix}-name`} className={label}>Nama menu *</label>
        <input id={`${prefix}-name`} name="name" required maxLength={80} defaultValue={m?.name} className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-category`} className={label}>Kategori *</label>
        <select id={`${prefix}-category`} name="category" defaultValue={m?.category || "kopi"} className={input}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${prefix}-price`} className={label}>Harga (Rp) *</label>
        <input id={`${prefix}-price`} name="price" required inputMode="numeric" defaultValue={m?.price} placeholder="22000" className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-img`} className={label}>Gambar (opsional)</label>
        <input id={`${prefix}-img`} name="img" defaultValue={m?.img} placeholder="/Assets/nama-file.jpg" className={input} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`${prefix}-desc`} className={label}>Deskripsi</label>
        <input id={`${prefix}-desc`} name="desc" maxLength={200} defaultValue={m?.desc} className={input} />
      </div>
    </>
  );
}

export default async function AdminMenuPage({ searchParams }) {
  if (!(await getSession())) redirect("/admin/login");

  const sp = await searchParams;
  const k = categories.some((c) => c.id === sp.k) ? sp.k : "";
  const all = await listMenuAdmin();
  const items = k ? all.filter((m) => m.category === k) : all;
  const soldOutCount = all.filter((m) => m.active && m.soldOut).length;
  const hiddenCount = all.filter((m) => !m.active).length;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <AdminHeader active="menu" />

      {sp.ok && (
        <p role="status" className="mb-6 rounded-lg border border-green-700 bg-green-900/40 px-4 py-3 text-sm text-green-300">{sp.ok}</p>
      )}
      {sp.err && (
        <p role="alert" className="mb-6 rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">{sp.err}</p>
      )}

      <section className="grid grid-cols-3 gap-4 mb-8">
        {[["Total menu", all.length], ["Sedang habis", soldOutCount], ["Disembunyikan", hiddenCount]].map(([t, v]) => (
          <div key={t} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">{t}</p>
            <p className="text-2xl font-bold text-amber-600">{v}</p>
          </div>
        ))}
      </section>

      <details suppressHydrationWarning className="mb-8 rounded-xl border border-neutral-700 bg-neutral-800 p-5" open={Boolean(sp.err) && !items.length}>
        <summary className="cursor-pointer font-semibold text-white">+ Tambah menu baru</summary>
        <form action={createMenu} className="mt-4 grid gap-4 md:grid-cols-2">
          <Fields prefix="baru" k={k} />
          <p className="md:col-span-2 text-xs text-gray-500">
            Untuk memakai gambar: salin file foto ke folder <code className="text-gray-300">public/Assets</code> di proyek, lalu tulis
            alamatnya di sini, misalnya <code className="text-gray-300">/Assets/es-kopi-susu.jpg</code>. Jika dikosongkan, menu tampil
            dengan huruf pertama namanya.
          </p>
          <div className="md:col-span-2">
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2.5 rounded-lg transition">Simpan menu baru</button>
          </div>
        </form>
      </details>

      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filter kategori">
        {[["", "Semua"], ...categories.map((c) => [c.id, c.label])].map(([id, text]) => (
          <Link
            key={id || "all"}
            href={id ? `/admin/menu?k=${id}` : "/admin/menu"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              k === id ? "bg-amber-600 text-white" : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            {text}
          </Link>
        ))}
      </nav>

      <ul className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className={`rounded-xl border border-neutral-700 bg-neutral-800 p-4 ${m.active ? "" : "opacity-60"}`}>
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-700">
                <MenuImage src={m.img} alt={m.name} name={m.name} category={m.category} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{m.name}</p>
                  {m.soldOut && <span className="rounded-full bg-red-600/20 border border-red-600/40 px-2 py-0.5 text-xs text-red-400">Habis</span>}
                  {!m.active && <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-gray-300">Disembunyikan</span>}
                </div>
                <p className="text-sm text-gray-400">
                  {catLabel[m.category]} · <span className="font-semibold text-amber-600">{rupiah(m.price)}</span>
                </p>
              </div>
              <form action={toggleSoldOut} className="shrink-0">
                <input type="hidden" name="k" value={k} />
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="sold_out" value={String(!m.soldOut)} />
                <button
                  aria-label={`${m.soldOut ? "Tandai tersedia" : "Tandai habis"}: ${m.name}`}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    m.soldOut
                      ? "border-green-700 text-green-400 hover:bg-green-900/40"
                      : "border-neutral-600 text-gray-200 hover:border-red-600 hover:text-red-400"
                  }`}
                >
                  {m.soldOut ? "Ada lagi" : "Tandai habis"}
                </button>
              </form>
            </div>

            <details suppressHydrationWarning className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-amber-600 transition">Ubah detail</summary>
              <form action={saveMenu} className="mt-4 grid gap-4 md:grid-cols-2">
                <Fields prefix={m.id} m={m} k={k} />
                <div className="md:col-span-2 flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" name="sold_out" defaultChecked={m.soldOut} className="h-4 w-4 accent-amber-600" />
                    Sedang habis
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" name="active" defaultChecked={m.active} className="h-4 w-4 accent-amber-600" />
                    Tampil di menu
                  </label>
                  <button className="ml-auto bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Simpan perubahan</button>
                </div>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}
