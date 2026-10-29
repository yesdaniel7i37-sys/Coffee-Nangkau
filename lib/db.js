import { Pool } from "pg";
import { menuItems as SEED_MENU } from "@/data/menu";
import { slugify } from "@/lib/menuInput";

export const STATUSES = ["BARU", "DIPROSES", "SELESAI", "DIBATALKAN"];

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    notes TEXT,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'BARU',
    service_type TEXT NOT NULL DEFAULT 'TAKEAWAY',
    table_number INTEGER,
    total INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_items_order ON order_items (order_id)`,
  `CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('kopi', 'nonkopi', 'makanan')),
    price INTEGER NOT NULL CHECK (price > 0),
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    sold_out BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
];

// Satu pool koneksi dipakai ulang (aman untuk hot reload saat development)
const g = globalThis;

// Pesan yang lebih mudah dipahami untuk masalah koneksi yang umum
function explain(e) {
  const msg = String(e?.message || "");
  if (/does not support SSL/i.test(msg)) {
    return "Server database tidak mendukung SSL. Hapus ?sslmode=require dari DATABASE_URL (itu hanya untuk database cloud).";
  }
  if (/SSL\/TLS required|no encryption|connection is insecure/i.test(msg)) {
    return "Database cloud mewajibkan SSL. Tambahkan ?sslmode=require di akhir DATABASE_URL.";
  }
  switch (e?.code) {
    case "ENOTFOUND":
      return "Alamat server database tidak ditemukan. Periksa DATABASE_URL (salin ulang dari dashboard database).";
    case "ETIMEDOUT":
      return "Koneksi ke database kehabisan waktu. Periksa DATABASE_URL dan koneksi internet server.";
    case "ECONNREFUSED":
      return "Tidak bisa terhubung ke PostgreSQL. Pastikan PostgreSQL sedang berjalan dan host/port di DATABASE_URL benar.";
    case "28P01":
      return "Password PostgreSQL salah. Periksa DATABASE_URL di file .env.local.";
    case "3D000":
      return "Database belum dibuat. Buat database bernama coffee_nangkau terlebih dahulu (lihat README).";
    default:
      return null;
  }
}

function pool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur. Tambahkan di file .env.local (lihat README).");
  }
  if (!g.__cnPool) {
    g.__cnPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: process.env.VERCEL ? 3 : 5, // di serverless banyak instans berjalan bersamaan
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000, // database cloud yang "tertidur" butuh beberapa detik untuk bangun
    });
    g.__cnPool.on("error", (e) => console.error("[database] koneksi terputus:", e.message));
  }
  return g.__cnPool;
}

// Membuat tabel jika belum ada (hanya sekali per proses)
function ready() {
  if (!g.__cnReady) {
    g.__cnReady = (async () => {
      const client = await pool().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(727274)"); // cegah balapan antar-proses
        for (const sql of SCHEMA) await client.query(sql);
        // Isi menu awal dari data/menu.js, hanya sekali saat tabel masih kosong
        const seeded = (await client.query("SELECT COUNT(*)::int AS n FROM menu_items")).rows[0].n;
        if (seeded === 0) {
          for (const [i, m] of SEED_MENU.entries()) {
            await client.query(
              `INSERT INTO menu_items (id, name, category, price, description, image, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [m.id, m.name, m.category, m.price, m.desc, m.img, i]
            );
          }
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    })().catch((e) => {
      g.__cnReady = null;
      const msg = explain(e);
      if (msg) {
        console.error("[database] " + msg);
        throw new Error(msg, { cause: e });
      }
      throw e;
    });
  }
  return g.__cnReady;
}

async function query(sql, params = []) {
  await ready();
  return pool().query(sql, params);
}

function newOrderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "CN-" + s;
}

async function insertOrder({ customer, method, items, serviceType = "TAKEAWAY", tableNumber = null, status = "BARU", createdAt }) {
  await ready();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = newOrderNumber();
    const client = await pool().connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        `INSERT INTO orders (order_number, customer_name, phone, address, notes, payment_method, status, service_type, table_number, total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          orderNumber, customer.name, customer.phone, customer.address || "",
          customer.notes || null, method, status, serviceType,
          serviceType === "DINE_IN" ? tableNumber : null, total,
          createdAt || new Date().toISOString(),
        ]
      );
      await client.query(
        `INSERT INTO order_items (order_id, item_id, name, price, quantity)
         SELECT $1, * FROM unnest($2::text[], $3::text[], $4::int[], $5::int[])`,
        [
          res.rows[0].id,
          items.map((i) => i.id), items.map((i) => i.name),
          items.map((i) => i.price), items.map((i) => i.quantity),
        ]
      );
      await client.query("COMMIT");
      return { orderNumber, total };
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      if (e.code === "23505" && attempt < 2) continue; // nomor pesanan kebetulan kembar, coba lagi
      throw e;
    } finally {
      client.release();
    }
  }
}

export const createOrder = (data) => insertOrder(data);

export async function listOrders(status) {
  const filter = STATUSES.includes(status);
  const res = await query(
    `SELECT id, order_number, customer_name, phone, address, notes, payment_method, status, service_type, table_number, total, created_at
     FROM orders ${filter ? "WHERE status = $1" : ""} ORDER BY created_at DESC LIMIT 100`,
    filter ? [status] : []
  );
  const orders = res.rows.map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    phone: r.phone,
    address: r.address || "",
    notes: r.notes || "",
    paymentMethod: r.payment_method,
    status: r.status,
    serviceType: r.service_type,
    tableNumber: r.table_number,
    total: r.total,
    createdAt: new Date(r.created_at).toISOString(),
    items: [],
  }));
  if (orders.length) {
    const itemsRes = await query(
      `SELECT order_id, name, price, quantity FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id`,
      [orders.map((o) => o.id)]
    );
    const byId = new Map(orders.map((o) => [o.id, o]));
    for (const r of itemsRes.rows) {
      byId.get(r.order_id)?.items.push({ name: r.name, price: r.price, quantity: r.quantity });
    }
  }
  return orders;
}

export async function getStats() {
  const res = await query(`
    SELECT
      COUNT(*)::int AS total,
      COALESCE(SUM(CASE WHEN status = 'BARU' THEN 1 ELSE 0 END), 0)::int AS baru,
      COALESCE(SUM(CASE WHEN status = 'DIPROSES' THEN 1 ELSE 0 END), 0)::int AS diproses,
      COALESCE(SUM(CASE WHEN status <> 'DIBATALKAN' THEN total ELSE 0 END), 0)::bigint AS revenue
    FROM orders`);
  const r = res.rows[0];
  return { total: r.total, baru: r.baru, diproses: r.diproses, revenue: Number(r.revenue) };
}

export async function updateOrderStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error("Status tidak valid");
  await query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
}

// Data contoh untuk mengisi dashboard (hanya jika tabel masih kosong)
export async function seedDemoOrders() {
  const count = (await query("SELECT COUNT(*)::int AS n FROM orders")).rows[0].n;
  if (count > 0) return 0;

  const menuRows = (await query("SELECT id, name, price FROM menu_items")).rows;
  const pick = (id, quantity) => {
    const m = menuRows.find((x) => x.id === id);
    return { id: m.id, name: m.name, price: m.price, quantity };
  };
  const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
  // [nama, metode, status, jam lalu, layanan, meja, item]
  const demo = [
    ["Rina Putri", "bank", "BARU", 1, "DINE_IN", 4, [["cappuccino", 2], ["croissant", 1]]],
    ["Dimas Pratama", "ewallet", "BARU", 3, "TAKEAWAY", null, [["caramel-macchiato", 1]]],
    ["Laras Wulandari", "cod", "DIPROSES", 8, "DINE_IN", 7, [["club-sandwich", 1], ["lemon-tea", 1]]],
    ["Fajar Nugroho", "bank", "DIPROSES", 20, "TAKEAWAY", null, [["americano", 2], ["pancake-stack", 1]]],
    ["Maya Anggraini", "ewallet", "SELESAI", 30, "DINE_IN", 2, [["mocha", 1], ["chocolate-cake", 1]]],
    ["Hendra Saputra", "cod", "SELESAI", 52, "TAKEAWAY", null, [["espresso", 3]]],
    ["Putri Ayu", "bank", "SELESAI", 75, "DINE_IN", 9, [["matcha-latte", 2], ["caesar-salad", 1]]],
    ["Rizky Maulana", "cod", "DIBATALKAN", 90, "TAKEAWAY", null, [["aglio-olio", 1]]],
  ];
  let n = 0;
  for (const [name, method, status, h, serviceType, tableNumber, items] of demo) {
    await insertOrder({
      customer: { name, phone: "0812-3456-78" + String(10 + n), notes: n % 3 === 0 ? "Data contoh" : "" },
      method, status, serviceType, tableNumber, createdAt: hoursAgo(h),
      items: items.map(([id, q]) => pick(id, q)),
    });
    n++;
  }
  return n;
}

// ---------------------------------------------------------------------------
// Menu (dikelola dari panel admin)
// ---------------------------------------------------------------------------
const menuOut = (r) => ({
  id: r.id, name: r.name, category: r.category, price: r.price,
  desc: r.description, img: r.image, soldOut: r.sold_out, active: r.active,
});

// Menu yang tampil untuk pembeli (termasuk yang sedang habis)
export async function getMenu() {
  const res = await query("SELECT * FROM menu_items WHERE active ORDER BY sort_order, id");
  return res.rows.map(menuOut);
}

// Menu yang boleh dipesan dan direkomendasikan: tampil dan tidak habis
export async function getAvailableMenu() {
  const res = await query("SELECT * FROM menu_items WHERE active AND NOT sold_out ORDER BY sort_order, id");
  return res.rows.map(menuOut);
}

// Urutan hasil mengikuti urutan ids; menu yang disembunyikan/tidak ada dilewati
export async function getMenuByIds(ids) {
  if (!ids.length) return [];
  const res = await query("SELECT * FROM menu_items WHERE active AND id = ANY($1::text[])", [ids]);
  const byId = new Map(res.rows.map((r) => [r.id, menuOut(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export async function listMenuAdmin() {
  const res = await query("SELECT * FROM menu_items ORDER BY sort_order, id");
  return res.rows.map(menuOut);
}

export async function createMenuItem(m) {
  await ready();
  const base = slugify(m.name) || "menu";
  for (let i = 0; i < 30; i++) {
    const id = i === 0 ? base : `${base}-${i + 1}`;
    try {
      await pool().query(
        `INSERT INTO menu_items (id, name, category, price, description, image, sold_out, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM menu_items))`,
        [id, m.name, m.category, m.price, m.desc, m.img, m.soldOut, m.active]
      );
      return id;
    } catch (e) {
      if (e.code === "23505") continue; // ID sudah dipakai, coba akhiran berikutnya
      throw e;
    }
  }
  throw new Error("Gagal membuat ID menu yang unik.");
}

export async function updateMenuItem(id, m) {
  const res = await query(
    `UPDATE menu_items SET name = $2, category = $3, price = $4, description = $5, image = $6, sold_out = $7, active = $8
     WHERE id = $1`,
    [id, m.name, m.category, m.price, m.desc, m.img, m.soldOut, m.active]
  );
  return res.rowCount > 0;
}

export async function setMenuSoldOut(id, soldOut) {
  const res = await query("UPDATE menu_items SET sold_out = $2 WHERE id = $1", [id, soldOut]);
  return res.rowCount > 0;
}
