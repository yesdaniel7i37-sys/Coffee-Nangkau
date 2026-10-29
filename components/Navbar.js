"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/menu", label: "Menu" },
  { href: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, setCartOpen, searchOpen, setSearchOpen, query, setQuery } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSearch = () => {
    setMobileOpen(false);
    if (pathname !== "/menu") {
      router.push("/menu");
      setSearchOpen(true);
    } else {
      if (searchOpen) setQuery("");
      setSearchOpen(!searchOpen);
    }
  };

  return (
    <>
      <nav className="bg-black text-white px-6 md:px-16 py-4 fixed w-full top-0 z-50 border-b border-neutral-800">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/"><Logo className="text-xl md:text-2xl font-bold" /></Link>

          <div className="hidden md:flex space-x-8 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? "text-amber-600" : "hover:text-amber-600 transition"}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleSearch} aria-label="Cari menu" className="hover:text-amber-600 transition">
              <FiSearch className="h-5 w-5" />
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Keranjang" className="hover:text-amber-600 transition relative">
              <FiShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span aria-label={`${count} item di keranjang`} className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              className="md:hidden hover:text-amber-600 transition"
            >
              {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-black border-b border-neutral-800 z-40 px-6 py-4 flex flex-col gap-4 text-white">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={pathname === l.href ? "text-amber-600" : "hover:text-amber-600 transition"}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {searchOpen && pathname === "/menu" && (
        <div className="fixed top-16 left-0 right-0 bg-neutral-800 border-b border-neutral-700 z-40 py-4">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari menu..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition"
            />
          </div>
        </div>
      )}
    </>
  );
}
