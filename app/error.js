"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 pb-16 pt-28 text-center">
      <div>
        <p className="mb-4 text-6xl font-bold text-amber-600">:(</p>
        <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">Terjadi kendala</h1>
        <p className="mx-auto mb-8 max-w-md text-gray-400">
          Halaman ini gagal dimuat. Coba lagi sebentar. Jika terus berulang, kemungkinan website sedang tidak dapat
          menjangkau database.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-700">Coba lagi</button>
          <Link href="/" className="rounded-lg border border-neutral-600 px-6 py-3 font-medium text-white transition hover:border-amber-600">Ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
