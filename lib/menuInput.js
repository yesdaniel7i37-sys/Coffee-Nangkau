// Validasi form menu dari panel admin. Fungsi murni, mudah diuji.
export const CATEGORY_IDS = ["kopi", "nonkopi", "makanan"];

const IMG_LOCAL = /^\/[A-Za-z0-9_\-./]+\.(?:jpe?g|png|webp|avif|gif)$/i; // file di folder public
const IMG_UNSPLASH = /^https:\/\/images\.unsplash\.com\/[A-Za-z0-9_\-./?=&%]+$/;

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parseMenuForm(fd, { create = false } = {}) {
  const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

  const name = clean(fd.get("name"));
  if (!name) return { error: "Nama menu wajib diisi." };
  if (name.length > 80) return { error: "Nama menu maksimal 80 karakter." };

  const category = String(fd.get("category") ?? "");
  if (!CATEGORY_IDS.includes(category)) return { error: "Kategori tidak valid." };

  // Titik dianggap pemisah ribuan: "22.000" sama dengan "22000"
  const rawPrice = String(fd.get("price") ?? "").trim().replace(/[.\s]/g, "");
  if (!/^\d{1,8}$/.test(rawPrice) || Number(rawPrice) < 1 || Number(rawPrice) > 10_000_000) {
    return { error: "Harga harus berupa angka bulat (rupiah) antara 1 dan 10.000.000." };
  }

  const desc = clean(fd.get("desc"));
  if (desc.length > 200) return { error: "Deskripsi maksimal 200 karakter." };

  // Gambar: file di folder public (misalnya /Assets/es-kopi.jpg) atau alamat Unsplash.
  // Alamat lain ditolak karena tidak diizinkan oleh konfigurasi gambar Next.js.
  const img = String(fd.get("img") ?? "").trim();
  const imgOk =
    !img ||
    (img.length <= 300 &&
      !img.includes("..") &&
      ((IMG_LOCAL.test(img) && !img.includes("//")) || IMG_UNSPLASH.test(img)));
  if (!imgOk) {
    return { error: "Alamat gambar harus berupa file di folder public, misalnya /Assets/es-kopi.jpg (atau dikosongkan)." };
  }

  return {
    value: {
      name, category, price: Number(rawPrice), desc, img,
      soldOut: fd.get("sold_out") === "on",
      active: create ? true : fd.get("active") === "on",
    },
  };
}
