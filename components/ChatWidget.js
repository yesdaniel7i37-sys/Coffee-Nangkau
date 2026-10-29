"use client";
import { useEffect, useRef, useState } from "react";
import MenuImage from "@/components/MenuImage";
import { FiMessageCircle, FiX, FiSend, FiCheck } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { rupiah } from "@/lib/format";

const SUGGESTIONS = ["Yang manis dan creamy", "Segar, tanpa kopi", "Makanan ringan", "Budget 30 ribu"];
const WELCOME = {
  role: "assistant",
  content: "Halo! Saya asisten Coffee Nangkau. Ceritakan seleranya (manis atau pahit, panas atau dingin, budget), nanti saya carikan menu yang pas.",
  items: [],
};

export default function ChatWidget() {
  const { addToCart } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text) {
    const content = text.trim().slice(0, 300);
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next
        .filter((m) => m !== WELCOME && !m.error)
        .map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan. Coba lagi.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply, items: data.items || [], source: data.source }]);
    } catch (e) {
      const msg = e instanceof TypeError ? "Tidak bisa terhubung ke server. Periksa koneksi Anda." : e.message;
      setMessages((m) => [...m, { role: "assistant", content: msg, items: [], error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function addItem(item) {
    addToCart(item);
    setJustAdded(item.id);
    setTimeout(() => setJustAdded((cur) => (cur === item.id ? null : cur)), 1500);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka asisten rekomendasi menu"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-black/40 flex items-center justify-center transition hover:scale-105"
      >
        <FiMessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="Asisten rekomendasi menu"
      className="fixed z-40 bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-2rem)] flex flex-col rounded-2xl border border-neutral-700 bg-neutral-800 shadow-2xl shadow-black/60 overflow-hidden"
    >
      <header className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
        <div>
          <h2 className="text-white font-semibold leading-tight">Asisten Menu</h2>
          <p className="text-xs text-gray-400">Rekomendasi sesuai seleramu</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Tutup asisten" className="text-gray-300 hover:text-amber-600 transition">
          <FiX className="h-5 w-5" />
        </button>
      </header>

      <div ref={listRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className="max-w-[88%]">
              <p
                className={`px-3 py-2 text-sm whitespace-pre-wrap break-words rounded-2xl ${
                  m.role === "user"
                    ? "bg-amber-600 text-white rounded-br-sm"
                    : m.error
                    ? "bg-red-900/40 text-red-200 border border-red-800 rounded-bl-sm"
                    : "bg-neutral-700 text-gray-100 rounded-bl-sm"
                }`}
              >
                {m.content}
              </p>

              {m.items?.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {m.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900 p-2">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-700">
                        <MenuImage src={it.img} alt={it.name} name={it.name} category={it.category} sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{it.name}</p>
                        <p className="text-xs text-amber-600 font-semibold">{rupiah(it.price)}</p>
                      </div>
                      <button
                        onClick={() => addItem(it)}
                        aria-label={`Pesan ${it.name}`}
                        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
                      >
                        {justAdded === it.id ? (
                          <span className="inline-flex items-center gap-1"><FiCheck /> Ditambah</span>
                        ) : (
                          "Pesan"
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {m.source === "fallback" && (
                <p className="mt-1 text-[11px] text-gray-500">Rekomendasi sederhana (tanpa AI)</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" aria-label="Asisten sedang mengetik">
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-neutral-700 px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-neutral-600 px-3 py-1.5 text-xs text-gray-200 transition hover:border-amber-600 hover:text-amber-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-neutral-700 bg-neutral-900 p-3"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">Pesan untuk asisten</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder="Contoh: manis dan tidak pahit"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Kirim"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white transition hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">Jangan tulis data pribadi. Jawaban bisa keliru, cek kembali menunya.</p>
      </form>
    </section>
  );
}
