# Coffee Nangkau

Website toko kopi (demo) dibangun dengan **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS 3**, dan **Framer Motion**.

> Proyek portofolio. Pembayaran, form kontak, nomor rekening, alamat, dan testimoni adalah **data contoh**; tidak ada transaksi atau pengiriman data sungguhan.

## Fitur

- 4 halaman: Home, Tentang Kami, Menu, Kontak
- Menu dengan tab kategori, pencarian lintas kategori, dan modal detail produk
- Keranjang belanja global (tambah, kurangi, hapus) yang tersimpan di `localStorage`
- Alur checkout simulasi: ringkasan pesanan, data pelanggan, pilihan metode pembayaran, nomor pesanan
- Pembeli memilih **makan/minum di tempat** (dengan nomor meja) atau **take away** di keranjang; jumlah meja diatur di `lib/service.js`
- **Kelola menu dari admin**: tambah menu, ubah nama/harga/deskripsi, tandai habis, dan sembunyikan menu
- **Asisten rekomendasi menu** (chat melayang) memakai Gemini API, dengan cadangan rekomendasi berbasis aturan jika AI tidak tersedia
- **Backend:** checkout menyimpan pesanan ke database (PostgreSQL); harga dihitung ulang di server
- **Panel admin** (`/admin`): login, statistik, filter status, dan ubah status pesanan
- Animasi muncul saat scroll (IntersectionObserver) dan transisi daftar menu (Framer Motion)
- Navigasi responsif dengan menu hamburger di mobile
- Gambar dioptimalkan dengan `next/image`, metadata SEO per halaman

## Struktur

```
app/          halaman (home, menu, kontak, tentang-kami) + layout global
components/   Navbar, Footer, CartSidebar, PaymentModal, Reveal, ...
context/      AppContext: state keranjang, pencarian, modal
data/         data menu (satu sumber untuk semua kartu produk)
lib/          helper (format rupiah)
public/Assets gambar lokal
```

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
```

## Deploy

Push ke GitHub, lalu impor repo di [Vercel](https://vercel.com). Tidak perlu konfigurasi tambahan.

> Nama folder `public/Assets` bersifat case-sensitive di server Linux; semua path gambar memakai `/Assets/...`.

## Backend & Admin

Butuh **PostgreSQL** yang berjalan di komputer.

### 1. Pasang PostgreSQL (Windows)
1. Unduh installer dari https://www.postgresql.org/download/windows/ (klik *Download the installer*).
2. Jalankan installer. Biarkan semua pilihan bawaan (termasuk **pgAdmin 4**, port **5432**).
3. Saat diminta, isi **password untuk user `postgres`** dan ingat baik-baik.
4. Setelah selesai, kotak *Stack Builder* boleh dibatalkan.

### 2. Buat database
Buka **pgAdmin 4**, masukkan password tadi, lalu klik kanan **Databases > Create > Database...**, beri nama `coffee_nangkau`, dan klik **Save**.
(Alternatif: buka *SQL Shell (psql)*, lalu jalankan `CREATE DATABASE coffee_nangkau;`.)

### 3. Atur file environment
```bash
copy .env.example .env.local
```
Buka `.env.local`, lalu isi `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, dan ganti `PASSWORD_POSTGRES_ANDA` di `DATABASE_URL` dengan password dari langkah 1.

### 4. Jalankan
```bash
npm install
npm run dev
```
- Website: http://localhost:3000, panel admin: http://localhost:3000/admin
- Tabel dibuat otomatis saat pertama kali dibutuhkan.
- Tombol **Isi data contoh** di dashboard admin membuat 8 pesanan contoh.
- Melihat data: di pgAdmin buka `coffee_nangkau > Schemas > public > Tables > orders`, klik kanan, **View/Edit Data > All Rows**.

### Deploy
Database lokal tidak ikut ke server. Untuk website live, buat database PostgreSQL cloud (misalnya [Neon](https://neon.tech) atau [Supabase](https://supabase.com)), lalu isi `DATABASE_URL` (biasanya berakhiran `?sslmode=require`), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `AUTH_SECRET` di *Environment Variables* hosting. Kodenya tidak perlu diubah.

Struktur tambahan: `app/admin/` (login, dashboard, server actions), `app/api/orders/` (endpoint pesanan), `lib/db.js` (query database), `lib/auth.js` dan `middleware.js` (sesi login berbasis JWT di cookie httpOnly).

## Asisten Rekomendasi Menu (AI)

Chat kecil di pojok kanan bawah yang merekomendasikan menu sesuai selera pengunjung.

- Memakai **Gemini API** (Google AI Studio). Buat API key di https://aistudio.google.com/apikey, lalu isi `GEMINI_API_KEY` di `.env.local` dan restart server.
- Tanpa API key, atau jika AI gagal/kuotanya habis, asisten otomatis memakai **rekomendasi sederhana berbasis kata kunci** (`lib/recommend.js`), jadi fiturnya tidak pernah mati.
- API key hanya dipakai di server (`app/api/chat/route.js`) dan tidak pernah dikirim ke browser.
- Model hanya boleh merekomendasikan menu yang ada: daftar menu dikirim ke model, lalu setiap `id` dari jawabannya diperiksa ulang di server sebelum ditampilkan.
- Perlindungan penyalahgunaan: batas 8 pesan per menit dan 80 per hari per pengunjung, teks maksimal 300 karakter, riwayat maksimal 6 pesan, dan batas harian total panggilan AI (`AI_DAILY_CAP`, bawaan 300). Penghitung disimpan di memori server, jadi bukan pengaman mutlak di hosting serverless.
- Nama model diatur lewat `GEMINI_MODEL` karena nama model Gemini sering berganti. Jika terminal menampilkan `[ai] gagal ... Gemini HTTP 404`, periksa nama model di https://ai.google.dev/gemini-api/docs/models.
- Catatan privasi: pada paket gratis Google dapat memakai data yang dikirim untuk meningkatkan produknya. Karena itu widget meminta pengunjung tidak menulis data pribadi.

## Kelola Menu dari Admin

Menu disimpan di tabel `menu_items` (PostgreSQL), bukan lagi di kode. Saat pertama kali dipakai, tabel diisi otomatis dari `data/menu.js`; setelah itu perubahan dilakukan lewat **/admin/menu**.

- **Tambah menu**, **ubah harga/nama/deskripsi/kategori**, **tandai habis**, dan **sembunyikan** menu dari halaman pembeli.
- Menu yang *habis* tetap tampil dengan label "Habis" dan tidak bisa dipesan; menu yang *disembunyikan* tidak tampil sama sekali. Menu tidak bisa dihapus agar riwayat pesanan tetap utuh.
- Server selalu mengambil nama dan harga dari database saat membuat pesanan, sehingga harga lama di keranjang pembeli tidak pernah dipakai, dan pesanan berisi menu yang habis/disembunyikan ditolak.
- Asisten AI dan rekomendasi cadangan hanya memakai menu yang tampil dan belum habis.
- Gambar: salin file foto ke `public/Assets`, lalu tulis alamatnya di form (misalnya `/Assets/es-kopi-susu.jpg`). Hanya file lokal atau alamat `images.unsplash.com` yang diterima. Jika kosong atau file tidak ditemukan, tampil huruf pertama nama menu.

## Deploy

Panduan lengkap deploy ke Vercel dengan database Neon ada di [DEPLOY.md](./DEPLOY.md).

Variabel lingkungan yang diperlukan: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `DATABASE_URL`, serta (opsional) `GEMINI_API_KEY` dan `GEMINI_MODEL`. Di production, login admin menolak kata sandi/secret yang lemah dan membatasi percobaan masuk (10 per 10 menit per IP); pemesanan dibatasi 10 per 10 menit per IP.

