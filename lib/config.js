// Memeriksa pengaturan login admin. Mengembalikan teks masalah, atau null jika aman.
// Di production (mis. Vercel) nilai contoh/lemah ditolak supaya admin publik tidak mudah dibobol.
export function configProblem(env = process.env) {
  const { ADMIN_USERNAME: u, ADMIN_PASSWORD: p, AUTH_SECRET: s, NODE_ENV } = env;
  if (!u || !p || !s) return "Server belum dikonfigurasi. Isi ADMIN_USERNAME, ADMIN_PASSWORD, dan AUTH_SECRET.";
  if (s.length < 16) return "AUTH_SECRET minimal 16 karakter.";
  if (NODE_ENV === "production") {
    if (s.length < 32 || /teks-acak|ganti|contoh|secret|password|minimal/i.test(s)) {
      return "AUTH_SECRET belum aman: gunakan teks acak minimal 32 karakter.";
    }
    if (p.length < 10 || /^(admin|password|ganti|123456|qwerty)/i.test(p) || p === u) {
      return "ADMIN_PASSWORD belum aman: minimal 10 karakter dan jangan diawali kata umum.";
    }
  }
  return null;
}
