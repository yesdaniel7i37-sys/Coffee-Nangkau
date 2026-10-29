import { NextResponse } from "next/server";
import { askGemini, pickItems } from "@/lib/ai";
import { getAvailableMenu } from "@/lib/db";
import { recommend } from "@/lib/recommend";
import { rateLimit, takeAiBudget } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // detik; waktu tunggu AI sendiri 12 detik

const MAX_CHARS = 300;
const MAX_MESSAGES = 6;
const AI_DAILY_CAP = Number(process.env.AI_DAILY_CAP) || 300;

const toClient = (m) => ({ id: m.id, name: m.name, price: m.price, desc: m.desc, img: m.img, category: m.category, soldOut: false });
const json = (body, status = 200, headers) => NextResponse.json(body, { status, headers });

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
  const perMinute = rateLimit(`m:${ip}`, 8, 60_000);
  const perDay = rateLimit(`d:${ip}`, 80, 86_400_000);
  if (!perMinute.ok || !perDay.ok) {
    const retry = Math.max(perMinute.retryAfter || 0, perDay.retryAfter || 0);
    return json(
      { error: "Terlalu banyak pertanyaan. Coba lagi sebentar lagi." },
      429,
      { "Retry-After": String(retry) }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Format data tidak valid." }, 400);
  }

  // Bersihkan riwayat: hanya peran yang dikenal, teks dipangkas, jumlah dibatasi
  let messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content)
    .slice(-MAX_MESSAGES);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "Tulis pertanyaan Anda dulu." }, 400);
  }

  // Hanya menu yang tampil dan tidak habis yang boleh direkomendasikan
  const menu = await getAvailableMenu();
  if (!menu.length) {
    return json({ reply: "Maaf, menu sedang kosong. Silakan coba lagi nanti.", items: [], source: "fallback" });
  }

  let reply = "";
  let items = [];
  let source = "fallback";

  if (process.env.GEMINI_API_KEY && takeAiBudget(AI_DAILY_CAP)) {
    try {
      const out = await askGemini(messages, menu);
      if (out) {
        reply = out.reply;
        items = pickItems(out.ids, menu);
        source = "ai";
      }
    } catch (e) {
      // Detail error hanya di terminal server, tidak dikirim ke pengunjung
      console.error("[ai] gagal, memakai rekomendasi sederhana:", e?.name === "AbortError" ? "timeout" : e?.message);
    }
  }

  if (source !== "ai") {
    const r = recommend(messages[messages.length - 1].content, menu);
    reply = r.reply;
    items = r.items;
  }

  return json({ reply, items: items.map(toClient), source });
}
