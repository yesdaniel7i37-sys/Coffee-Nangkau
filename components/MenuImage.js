"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Warna latar sementara per kategori (dipakai juga bila gambar belum ada)
export const CATEGORY_GRAD = {
  kopi: "from-amber-400 to-amber-600",
  nonkopi: "from-emerald-400 to-emerald-600",
  makanan: "from-orange-400 to-orange-600",
};

// Gambar menu. Jika alamat kosong atau file tidak ditemukan, tampil huruf pertama nama menu
// di atas warna kategori. Harus diletakkan di dalam wadah ber-posisi "relative" dan berukuran tetap.
export default function MenuImage({ src, alt, name, category, sizes = "(min-width: 768px) 33vw, 100vw", className = "" }) {
  const [failed, setFailed] = useState(!src);
  const ref = useRef(null);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  // Menangkap gambar yang sudah gagal dimuat sebelum halaman selesai dipasang di browser
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    const letter = Array.from((name || alt || "?").trim())[0]?.toUpperCase() || "?";
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRAD[category] || CATEGORY_GRAD.kopi}`}
      >
        <span className="text-5xl font-bold text-white/80">{letter}</span>
      </div>
    );
  }
  return (
    <Image ref={ref} src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  );
}
