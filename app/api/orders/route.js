import { NextResponse } from "next/server";
import { createOrder, getMenuByIds } from "@/lib/db";
import { SERVICE_TYPES, isValidTable, TABLE_COUNT } from "@/lib/service";
import { rateLimit } from "@/lib/rateLimit";

const METHODS = ["bank", "ewallet", "cod"];
const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
  const limited = rateLimit(`order:${ip}`, 10, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak pesanan dari perangkat ini. Coba lagi beberapa menit lagi." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const customer = {
    name: text(body?.customer?.name, 100),
    phone: "",
    address: "",
    notes: text(body?.customer?.notes, 300),
  };
  if (!customer.name) {
    return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  }
  if (!SERVICE_TYPES.includes(body?.serviceType)) {
    return NextResponse.json({ error: "Pilih makan di tempat atau take away." }, { status: 400 });
  }
  const serviceType = body.serviceType;
  const tableNumber = serviceType === "DINE_IN" ? Number(body?.tableNumber) : null;
  if (serviceType === "DINE_IN" && !isValidTable(tableNumber)) {
    return NextResponse.json({ error: `Pilih nomor meja yang valid (1-${TABLE_COUNT}).` }, { status: 400 });
  }
  if (!METHODS.includes(body?.method)) {
    return NextResponse.json({ error: "Metode pembayaran tidak valid." }, { status: 400 });
  }
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 30) {
    return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
  }

  // Nama dan harga selalu diambil dari database, bukan dari browser
  const menuById = new Map(
    (await getMenuByIds([...new Set(body.items.map((it) => String(it?.id)))])).map((m) => [m.id, m])
  );
  const items = [];
  for (const it of body.items) {
    const menu = menuById.get(String(it?.id));
    const quantity = Number(it?.quantity);
    if (!menu) {
      return NextResponse.json({ error: "Ada item yang sudah tidak tersedia. Kosongkan keranjang lalu pesan ulang." }, { status: 400 });
    }
    if (menu.soldOut) {
      return NextResponse.json({ error: `${menu.name} sedang habis. Hapus dari keranjang lalu coba lagi.` }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return NextResponse.json({ error: "Jumlah item tidak valid." }, { status: 400 });
    }
    items.push({ id: menu.id, name: menu.name, price: menu.price, quantity });
  }

  try {
    const { orderNumber, total } = await createOrder({ customer, method: body.method, items, serviceType, tableNumber });
    return NextResponse.json({ orderNumber, total }, { status: 201 });
  } catch (e) {
    console.error("Gagal menyimpan pesanan:", e);
    return NextResponse.json({ error: "Pesanan gagal disimpan. Coba lagi sebentar lagi." }, { status: 500 });
  }
}
