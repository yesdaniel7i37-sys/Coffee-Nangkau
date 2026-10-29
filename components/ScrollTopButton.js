"use client";
import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 left-6 bg-amber-600 hover:bg-amber-700 text-white w-12 h-12 rounded-full shadow-lg transition duration-300 z-50 flex items-center justify-center"
    >
      <FiArrowUp className="h-6 w-6" />
    </button>
  );
}
