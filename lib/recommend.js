import { menuItems } from "@/data/menu";
import { rupiah } from "@/lib/format";

// Rekomendasi sederhana berbasis kata kunci. Dipakai sebagai cadangan kalau AI tidak tersedia.
const byId = (ids, menu) => ids.map((id) => menu.find((m) => m.id === id)).filter(Boolean);
const POPULAR = ["cappuccino", "mocha", "caramel-macchiato"];

const RULES = [
  { re: /manis|sweet|cokelat|coklat|chocolate|karamel|caramel|dessert/, ids: ["caramel-macchiato", "mocha", "hot-chocolate", "taro-latte", "chocolate-cake", "pancake-stack"] },
  { re: /pahit|kuat|strong|bold|murni|begadang|ngantuk|melek|fokus|lembur/, ids: ["espresso", "americano"] },
  { re: /susu|creamy|lembut|latte|milk|foam|halus/, ids: ["cafe-latte", "cappuccino", "caramel-macchiato", "matcha-latte", "taro-latte"] },
  { re: /segar|haus|gerah|menyegarkan|\bes\b|\bice\b|dingin|buah|\bjus\b|smoothie|kepanasan/, ids: ["orange-juice", "lemon-tea", "strawberry-smoothie"] },
  { re: /hangat|\banget\b|hujan|\bhot\b|panas/, ids: ["hot-chocolate", "cappuccino", "cafe-latte", "americano"] },
  { re: /tanpa gula|sehat|diet|rendah gula/, ids: ["orange-juice", "lemon-tea", "americano", "espresso"] },
  { re: /ringan|camilan|cemilan|snack|kue|pastry|roti|sarapan/, ids: ["croissant", "chocolate-cake", "pancake-stack"] },
  { re: /kenyang|lapar|makan berat|berat|nasi/, ids: ["club-sandwich", "aglio-olio", "caesar-salad"] },
  { re: /matcha|\bteh\b|\btea\b|hijau/, ids: ["matcha-latte", "lemon-tea"] },
];

const STOPWORDS = new Set([
  "yang", "dengan", "untuk", "dong", "nih", "aku", "saya", "mau", "pengen", "ingin", "budget", "ribu",
  "banget", "enak", "apa", "ada", "ayo", "tolong", "bisa", "lagi", "yang", "kamu", "anda", "minta", "cari",
  "rekomendasi", "menu", "makan", "minum", "minuman", "makanan",
]);
const HOT_WEATHER = /cuaca panas|panas banget|panas sekali|hari panas|kepanasan/g;
const NO_COFFEE = /\b(tidak|gak|nggak|ngga|ga|bukan|tanpa|anti)\s+(suka\s+)?kopi|non[\s-]?kopi|asam lambung|lambung/;
const FOOD_WORDS = /makan|lapar|kenyang|sarapan|camilan|cemilan|snack|kue|pastry|roti|dessert|ringan|nasi/;
const DRINK_WORDS = /minum|kopi|haus|segar|\bjus\b|\bteh\b|latte|coffee|smoothie|matcha/;

function parseBudget(t) {
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb|k)\b/);
  if (m) return Math.round(parseFloat(m[1].replace(",", ".")) * 1000);
  m = t.match(/\b(\d{1,3}(?:\.\d{3})+|\d{4,6})\b/);
  if (m) return parseInt(m[1].replace(/\./g, ""), 10);
  return null;
}

export function recommend(rawText, menu = menuItems) {
  const t = String(rawText || "").toLowerCase();
  const text = t.replace(HOT_WEATHER, " segar ");

  if (/terima kasih|makasih|thanks|thank you/.test(text)) {
    return { reply: "Sama-sama! Kalau mau rekomendasi lain, tinggal ceritakan seleranya.", items: [] };
  }

  const matched = RULES.filter((r) => r.re.test(text));
  if (!matched.length && text.length < 30 && /^(hai|halo|hi|hello|hey|pagi|siang|sore|malam|selamat|permisi)\b/.test(text)) {
    return { reply: "Halo! Ceritakan seleranya (manis atau pahit, panas atau dingin, budget), nanti saya carikan menu yang pas.", items: [] };
  }

  const budget = parseBudget(text);
  const noCoffee = NO_COFFEE.test(text);
  const foodOnly = FOOD_WORDS.test(text) && !DRINK_WORDS.test(text);
  const wantsCoffee = /kopi|coffee/.test(text) && !noCoffee;

  // Batasi kategori bila pelanggan jelas menyebutnya
  let pool = menu;
  if (noCoffee) pool = menu.filter((m) => m.category !== "kopi");
  else if (foodOnly) pool = menu.filter((m) => m.category === "makanan");

  if (budget) {
    const within = pool.filter((m) => m.price <= budget);
    if (!within.length) {
      const cheapest = [...menu].sort((a, b) => a.price - b.price).slice(0, 2);
      return {
        reply: `Belum ada menu di bawah ${rupiah(budget)}. Yang paling terjangkau di sini:`,
        items: cheapest,
      };
    }
    pool = within;
  }

  const score = new Map(pool.map((m) => [m.id, 0]));
  // Menu yang disebut lebih awal dalam sebuah aturan dianggap paling cocok
  for (const r of matched) {
    r.ids.forEach((id, idx) => {
      if (score.has(id)) score.set(id, score.get(id) + 3 + (r.ids.length - idx) * 0.1);
    });
  }
  if (wantsCoffee) for (const m of pool) if (m.category === "kopi") score.set(m.id, score.get(m.id) + 2);

  // Kata dari pelanggan yang muncul di nama/deskripsi menu (agar menu baru dari admin ikut ditemukan)
  const words = [...new Set(text.split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w)))];
  for (const m of pool) {
    const hay = `${m.name} ${m.desc || ""}`.toLowerCase();
    const hits = words.filter((w) => hay.includes(w)).length;
    if (hits) score.set(m.id, score.get(m.id) + Math.min(hits, 2) * 1.5);
  }

  const ranked = pool
    .filter((m) => score.get(m.id) > 0)
    .sort((a, b) => score.get(b.id) - score.get(a.id));

  if (!ranked.length) {
    const popular = byId(POPULAR, menu).filter((m) => pool.includes(m));
    const items = (popular.length ? popular : [...pool].sort((a, b) => a.price - b.price)).slice(0, 3);
    return {
      reply: "Saya belum menangkap seleranya, tapi ini yang disukai banyak pelanggan. Coba ceritakan: manis atau pahit, panas atau dingin, atau budget Anda.",
      items,
    };
  }

  const items = ranked.slice(0, 3);
  const note = budget ? ` (dalam budget ${rupiah(budget)})` : "";
  return { reply: `Berikut pilihan yang cocok dengan permintaan Anda${note}:`, items };
}
