"use client";
import { useState } from "react";
import { FiEye, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { categories } from "@/data/menu";
import MenuImage from "@/components/MenuImage";
import { rupiah } from "@/lib/format";

export default function MenuClient({ items: menuItems }) {
  const { addToCart, query, searchOpen } = useApp();
  const [category, setCategory] = useState("kopi");
  const [detail, setDetail] = useState(null);

  const q = searchOpen ? query.trim().toLowerCase() : "";
  const current = categories.find((c) => c.id === category);
  // Saat mencari, cari di semua kategori; selain itu tampilkan kategori aktif
  const items = q
    ? menuItems.filter((m) => m.name.toLowerCase().includes(q))
    : menuItems.filter((m) => m.category === category);
  const heading = q ? `Hasil pencarian "${query.trim()}"` : current?.title;

  return (
    <main>
      <section className="pt-24 pb-12 bg-gradient-to-b from-neutral-800 to-neutral-900 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Menu <span className="text-amber-600">Kami</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Nikmati berbagai pilihan kopi, minuman, dan makanan terbaik kami
        </p>
      </section>

      <section className="sticky top-16 bg-neutral-800 shadow-lg z-30 py-4 border-b border-neutral-700">
        <div className="flex justify-center space-x-4 md:space-x-8 px-6">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-6 py-2 font-medium rounded-full transition ${
                category === c.id
                  ? "bg-amber-600 text-white"
                  : "bg-neutral-700 text-gray-300 hover:bg-neutral-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {heading}
          </h2>

          {items.length === 0 && (
            <p className="text-gray-400 text-center">Menu tidak ditemukan.</p>
          )}

          {/* Container Grid dengan Animasi Smooth */}
          <motion.div layout className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {items.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="bg-neutral-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-amber-600/20 transition-shadow duration-300 flex flex-col border border-neutral-700"
                >
                  <div className="relative h-48 overflow-hidden bg-neutral-700">
                    <MenuImage
                      src={m.img}
                      alt={m.name}
                      name={m.name}
                      category={m.category}
                      className={`hover:scale-110 transition duration-500 ${m.soldOut ? "opacity-50 grayscale" : ""}`}
                    />
                    {m.soldOut && (
                      <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                        Habis
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{m.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 h-10">{m.desc}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-2xl font-bold text-amber-600">
                        {rupiah(m.price)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetail(m)}
                          aria-label="Detail"
                          className="bg-neutral-700 hover:bg-neutral-600 text-white p-2 rounded-lg transition"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => addToCart(m)}
                          disabled={m.soldOut}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-gray-400 disabled:hover:bg-neutral-700"
                        >
                          {m.soldOut ? "Habis" : "Pesan"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Modal Detail dengan Animasi Smooth */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setDetail(null)}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-neutral-800 rounded-2xl max-w-2xl w-full border border-neutral-700"
            >
              <div className="relative">
                <button
                  onClick={() => setDetail(null)}
                  aria-label="Tutup"
                  className="absolute top-4 right-4 text-white hover:text-amber-600 transition z-10"
                >
                  <FiX className="h-8 w-8" />
                </button>
                <div className="relative h-64 overflow-hidden rounded-t-2xl bg-neutral-700">
                  <MenuImage src={detail.img} alt={detail.name} name={detail.name} category={detail.category} sizes="672px" className={detail.soldOut ? "opacity-50 grayscale" : ""} />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  {detail.name}
                </h3>
                <p className="text-gray-400 mb-6">{detail.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-amber-600">
                    {rupiah(detail.price)}
                  </span>
                  <button
                    onClick={() => {
                      addToCart(detail);
                      setDetail(null);
                    }}
                    disabled={detail.soldOut}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-gray-400 disabled:hover:bg-neutral-700"
                  >
                    {detail.soldOut ? "Sedang Habis" : "Tambah ke Keranjang"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}