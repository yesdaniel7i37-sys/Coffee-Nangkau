import Link from "next/link";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 pb-16 pt-28 text-center">
      <div>
        <p className="mb-4 text-6xl font-bold text-amber-600">404</p>
        <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">Halaman tidak ditemukan</h1>
        <p className="mx-auto mb-8 max-w-md text-gray-400">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-700">Ke Beranda</Link>
          <Link href="/menu" className="rounded-lg border border-neutral-600 px-6 py-3 font-medium text-white transition hover:border-amber-600">Lihat Menu</Link>
        </div>
      </div>
    </main>
  );
}
