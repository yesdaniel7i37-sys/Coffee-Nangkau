# Panduan Deploy: Vercel + Neon (PostgreSQL cloud)

Hasil akhirnya: website bisa dibuka siapa saja lewat link `https://nama-proyek.vercel.app`, lengkap dengan database dan panel admin.
Semua layanan di bawah punya paket gratis (batasnya bisa berubah, cek di situs masing-masing). Vercel paket gratis (Hobby) ditujukan untuk proyek pribadi non-komersial, cocok untuk portofolio.

Estimasi waktu: 20-30 menit.

---

## 0. Cek dulu di komputer Anda

1. Hapus folder sisa yang tidak dipakai: `update-tentang-kami` (kalau ada) dan `.next`.
2. Pastikan `package.json` memuat `pg` dan `jose` (kalau belum: `npm install pg jose`).
3. Jalankan `npm run build`. Harus selesai tanpa error merah (build tidak butuh database).
4. Pastikan `.gitignore` berisi baris `.env*.local` dan `node_modules`.

## 1. Taruh kode di GitHub

1. Buat akun di https://github.com (kalau belum), lalu buat repository baru (misalnya `coffee-nangkau`). **Jangan** centang "Add a README" karena proyek Anda sudah punya.
2. Di terminal, di dalam folder proyek:

   ```
   git init
   git add .
   git status
   ```

3. **Periksa daftar hasil `git status`.** File `.env.local`, folder `node_modules`, dan folder `.next` **tidak boleh muncul**. Yang boleh ada hanya `.env.example`. Kalau `.env.local` muncul, hentikan dan periksa `.gitignore`.
4. Lanjutkan (ganti `USERNAME` dengan username GitHub Anda):

   ```
   git commit -m "Coffee Nangkau"
   git branch -M main
   git remote add origin https://github.com/USERNAME/coffee-nangkau.git
   git push -u origin main
   ```

> Kalau `.env.local` sempat ter-commit atau ter-push, anggap semua isinya bocor: ganti password database, `ADMIN_PASSWORD`, `AUTH_SECRET`, dan buat API key Gemini yang baru.

## 2. Buat database di Neon

1. Daftar di https://neon.com, lalu buat **project** baru.
2. Pilih region yang dekat dengan pengunjung Anda, misalnya **Singapore** (`ap-southeast-1`). Ingat region ini untuk langkah 4.
3. Di dashboard project, klik tombol **Connect**, lalu salin **connection string**. Pilih yang memakai **pooled connection** (nama host mengandung `-pooler`). Bentuknya seperti:

   ```
   postgresql://pengguna:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   Simpan baris ini, itulah `DATABASE_URL` untuk website live.
4. Tidak perlu membuat tabel. Tabel dan 18 menu awal dibuat otomatis saat website pertama kali dibuka.

> Alternatif: di Vercel ada integrasi Neon (Storage / Marketplace) yang mengisi `DATABASE_URL` otomatis. Kalau memakai itu, langkah 2 dan variabel `DATABASE_URL` di langkah 4 bisa dilewati.

## 3. (Opsional) API key Gemini

Tanpa key, asisten chat tetap berjalan dengan rekomendasi sederhana. Untuk AI sungguhan, buat key di https://aistudio.google.com/apikey. Sebaiknya buat key **terpisah** untuk website live, supaya bisa dicabut tanpa mengganggu pengembangan di komputer Anda.

## 4. Deploy di Vercel

1. Masuk ke https://vercel.com dengan akun GitHub.
2. Klik **Add New > Project**, lalu pilih repository `coffee-nangkau` dan **Import**.
3. Framework akan terdeteksi sebagai **Next.js**. Biarkan pengaturan lain apa adanya.
4. Buka bagian **Environment Variables** dan isi satu per satu:

   | Nama | Nilai |
   |---|---|
   | `ADMIN_USERNAME` | username admin pilihan Anda |
   | `ADMIN_PASSWORD` | password kuat, minimal 10 karakter |
   | `AUTH_SECRET` | teks acak 64 karakter (cara membuatnya di bawah) |
   | `DATABASE_URL` | connection string dari Neon (langkah 2) |
   | `GEMINI_API_KEY` | key Gemini (opsional) |
   | `GEMINI_MODEL` | `gemini-3.5-flash-lite` (opsional) |

   Membuat `AUTH_SECRET` di terminal:

   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Website live menolak login jika `AUTH_SECRET` kurang dari 32 karakter atau memakai kata contoh, dan jika `ADMIN_PASSWORD` terlalu lemah (misalnya `admin123`). Itu disengaja.
5. Klik **Deploy** dan tunggu sekitar 1-3 menit.
6. (Disarankan) Setelah berhasil, buka **Settings** project, cari pengaturan **Function Region**, dan pilih wilayah yang sama dengan database (Singapore, `sin1`). Setelah diubah, lakukan **Redeploy** agar berlaku. Ini membuat halaman lebih cepat karena server dan database berdekatan.

> Setiap kali Anda mengubah Environment Variables, lakukan **Redeploy** (Deployments > titik tiga > Redeploy), karena perubahan baru berlaku di deploy berikutnya.

## 5. Cek hasilnya

Buka link Vercel Anda, lalu periksa satu per satu:

- [ ] `/` dan `/menu` tampil, 18 menu muncul (tabel dibuat otomatis).
- [ ] Buat satu pesanan dari halaman Menu sampai muncul nomor pesanan.
- [ ] `/admin` meminta login. Masuk dengan username dan password dari langkah 4, lalu pesanan tadi muncul.
- [ ] `/admin/menu`: coba tandai satu menu habis, lalu cek halaman Menu.
- [ ] Chat di pojok kanan bawah menjawab. Jika tidak ada tulisan "Rekomendasi sederhana (tanpa AI)", berarti Gemini aktif.
- [ ] Buka satu alamat yang tidak ada (misalnya `/ngawur`) dan lihat halaman 404 berbahasa Indonesia.

## 6. Kalau ada masalah

Lihat log di Vercel: **Project > Logs** (atau **Deployments > pilih deploy > Runtime Logs**). Pesan berawalan `[database]` atau `[ai]` menyebut penyebabnya.

| Gejala | Penyebab dan solusi |
|---|---|
| Login: "AUTH_SECRET belum aman" atau "ADMIN_PASSWORD belum aman" | Isi ulang variabel itu sesuai syarat di langkah 4, lalu Redeploy. |
| Login: "Server belum dikonfigurasi" | Salah satu dari `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET` belum diisi. |
| `/menu` menampilkan "Terjadi kendala" | Hampir pasti database. Cek log: `[database] ...`. Salin ulang `DATABASE_URL` dari Neon. |
| Log: "Database cloud mewajibkan SSL" | Tambahkan `?sslmode=require` di akhir `DATABASE_URL`. |
| Log: gagal terhubung padahal alamat benar | Coba hapus `&channel_binding=require` dari `DATABASE_URL` jika ada. |
| Halaman pertama lambat setelah lama tidak dibuka | Database gratis bisa "tertidur" saat sepi dan perlu beberapa detik untuk bangun. Wajar. |
| Login: "Terlalu banyak percobaan masuk" | Tunggu 10 menit (batas 10 percobaan per 10 menit). |
| Chat selalu berlabel "tanpa AI" | `GEMINI_API_KEY` belum diisi, salah, atau kuota gratis habis. Cek log `[ai]`. |
| Foto untuk menu baru tidak muncul | Di Vercel, foto tidak bisa diunggah dari admin. Salin file ke `public/Assets` di proyek, `git push`, dan tunggu deploy otomatis. |

## 7. Setelah live

1. Tambahkan link live di bagian atas `README.md`, lalu tambahkan screenshot desktop dan HP.
2. Isi deskripsi dan link website di halaman repository GitHub.
3. Tulis link live dan link GitHub di CV.
4. Setiap `git push` ke branch `main` akan men-deploy ulang otomatis.

## Hal yang perlu Anda ketahui

- Ini **proyek demo**: pembayaran hanya simulasi, dan data seperti alamat, telepon, serta testimoni adalah contoh. Website sudah menampilkan peringatan demo di checkout dan footer. Jangan memakainya untuk menerima pesanan sungguhan tanpa pengembangan lebih lanjut.
- Pembatas percobaan login dan pesanan disimpan di memori server. Di Vercel (serverless) hitungannya bisa terpisah per instans, jadi ini pengaman tambahan, bukan jaminan mutlak.
- Hanya ada satu akun admin. Siapa pun yang tahu password-nya bisa mengubah menu dan status pesanan.
- Pantau pemakaian kuota gratis (Google AI Studio, Neon, Vercel) sesekali. Jika kuota AI habis, chat tetap bekerja dengan rekomendasi sederhana.
