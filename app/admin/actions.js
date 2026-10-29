"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash, timingSafeEqual } from "node:crypto";
import { COOKIE, cookieOptions, createToken } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { configProblem } from "@/lib/config";
import { rateLimit } from "@/lib/rateLimit";
import { STATUSES, createMenuItem, seedDemoOrders, setMenuSoldOut, updateMenuItem, updateOrderStatus } from "@/lib/db";
import { CATEGORY_IDS, parseMenuForm } from "@/lib/menuInput";

const sha = (s) => createHash("sha256").update(s).digest();
const same = (a, b) => timingSafeEqual(sha(a), sha(b));

export async function login(_prev, formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  // Batasi percobaan masuk per alamat IP agar password tidak bisa ditebak berulang kali
  const ip = ((await headers()).get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
  const limited = rateLimit(`login:${ip}`, 10, 10 * 60_000);
  if (!limited.ok) {
    const menit = Math.max(1, Math.ceil(limited.retryAfter / 60));
    return { error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${menit} menit.`, username };
  }

  const problem = configProblem();
  if (problem) return { error: problem, username };
  const okUser = same(username, ADMIN_USERNAME);
  const okPass = same(password, ADMIN_PASSWORD);
  if (!(okUser && okPass)) return { error: "Username atau password salah.", username };

  const store = await cookies();
  store.set(COOKIE, await createToken(username), cookieOptions);
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE);
  redirect("/admin/login");
}

export async function changeStatus(formData) {
  if (!(await getSession())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin");
}

export async function seedDemo() {
  if (!(await getSession())) redirect("/admin/login");
  await seedDemoOrders();
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Kelola menu
// ---------------------------------------------------------------------------
function menuBack({ k, ok, err } = {}) {
  const qs = new URLSearchParams();
  if (CATEGORY_IDS.includes(k)) qs.set("k", k);
  if (ok) qs.set("ok", ok);
  if (err) qs.set("err", err);
  const q = qs.toString();
  redirect("/admin/menu" + (q ? "?" + q : ""));
}

function refreshMenuPages() {
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function createMenu(formData) {
  if (!(await getSession())) redirect("/admin/login");
  const k = String(formData.get("k") || "");
  const parsed = parseMenuForm(formData, { create: true });
  if (parsed.error) return menuBack({ k, err: parsed.error });
  let message;
  try {
    await createMenuItem(parsed.value);
    message = { ok: `Menu "${parsed.value.name}" ditambahkan.` };
  } catch (e) {
    console.error("Gagal menambah menu:", e);
    message = { err: "Menu gagal disimpan. Coba lagi." };
  }
  refreshMenuPages();
  menuBack({ k, ...message });
}

export async function saveMenu(formData) {
  if (!(await getSession())) redirect("/admin/login");
  const k = String(formData.get("k") || "");
  const id = String(formData.get("id") || "");
  const parsed = parseMenuForm(formData);
  if (parsed.error) return menuBack({ k, err: `${parsed.error} (perubahan belum disimpan)` });
  let message;
  try {
    const found = await updateMenuItem(id, parsed.value);
    message = found ? { ok: `Perubahan "${parsed.value.name}" disimpan.` } : { err: "Menu tidak ditemukan." };
  } catch (e) {
    console.error("Gagal menyimpan menu:", e);
    message = { err: "Perubahan gagal disimpan. Coba lagi." };
  }
  refreshMenuPages();
  menuBack({ k, ...message });
}

export async function toggleSoldOut(formData) {
  if (!(await getSession())) redirect("/admin/login");
  const k = String(formData.get("k") || "");
  const id = String(formData.get("id") || "");
  const soldOut = formData.get("sold_out") === "true";
  let message;
  try {
    const found = await setMenuSoldOut(id, soldOut);
    message = found ? { ok: soldOut ? "Menu ditandai habis." : "Menu tersedia kembali." } : { err: "Menu tidak ditemukan." };
  } catch (e) {
    console.error("Gagal mengubah status menu:", e);
    message = { err: "Status gagal diubah. Coba lagi." };
  }
  refreshMenuPages();
  menuBack({ k, ...message });
}
