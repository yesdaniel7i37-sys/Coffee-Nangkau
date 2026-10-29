"use client";
import { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

const info = [
  { Icon: FiMapPin, title: "Lokasi Kami", lines: ["Jl. Kopi Mantap No. 123", "Jakarta Selatan, 12345", "Indonesia"] },
  { Icon: FiPhone, title: "Telepon", lines: ["+62 812-3456-7890", "+62 21-1234-5678", "(Senin - Minggu, 08:00 - 22:00)"] },
  { Icon: FiMail, title: "Email", lines: ["info@coffeenangkau.com", "support@coffeenangkau.com", "(Respon dalam 24 jam)"] },
];
const hours = [["Senin - Jumat", "08:00 - 22:00"], ["Sabtu - Minggu", "09:00 - 23:00"], ["Hari Libur Nasional", "10:00 - 22:00"]];
const subjects = [["general", "Pertanyaan Umum"], ["reservation", "Reservasi"], ["catering", "Catering & Event"], ["complaint", "Kritik & Saran"], ["partnership", "Kerjasama"]];
const socials = [FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp];

const inputCls = "w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition";
const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export default function KontakPage() {
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // TODO: kirim `form` ke API route / server di sini
    console.log("Form submitted:", form);
    setForm(empty);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <main>
      <section className="pt-24 pb-12 bg-gradient-to-b from-neutral-800 to-neutral-900 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Hubungi <span className="text-amber-600">Kami</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Kami siap melayani Anda. Jangan ragu untuk menghubungi kami</p>
      </section>

      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-3 gap-8">
          {info.map(({ Icon, title, lines }) => (
            <div key={title} className="bg-neutral-800 rounded-xl p-8 text-center border border-neutral-700 hover:shadow-xl hover:shadow-amber-600/20 transition duration-300">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"><Icon className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-gray-400">{lines.map((l, i) => <span key={i}>{l}<br /></span>)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Kirim Pesan</h2>
            <p className="text-gray-400 mb-8">Isi form di bawah ini dan kami akan segera menghubungi Anda</p>
            <form onSubmit={submit} className="space-y-6">
              <div><label htmlFor="k-name" className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap *</label>
                <input id="k-name" required value={form.name} onChange={set("name")} className={inputCls} placeholder="Masukkan nama Anda" /></div>
              <div><label htmlFor="k-email" className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input id="k-email" required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="nama@email.com" /></div>
              <div><label htmlFor="k-phone" className="block text-sm font-medium text-gray-300 mb-2">Nomor Telepon</label>
                <input id="k-phone" type="tel" value={form.phone} onChange={set("phone")} className={inputCls} placeholder="+62 812-3456-7890" /></div>
              <div><label htmlFor="k-subject" className="block text-sm font-medium text-gray-300 mb-2">Subjek *</label>
                <select id="k-subject" required value={form.subject} onChange={set("subject")} className={inputCls}>
                  <option value="">Pilih subjek</option>
                  {subjects.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></div>
              <div><label htmlFor="k-message" className="block text-sm font-medium text-gray-300 mb-2">Pesan *</label>
                <textarea id="k-message" required rows={5} value={form.message} onChange={set("message")} className={inputCls + " resize-none"} placeholder="Tulis pesan Anda di sini..." /></div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2">
                <FiSend className="h-5 w-5" /> Kirim Pesan
              </button>
            </form>
            {sent && (
              <div className="mt-6 p-4 bg-green-900 border border-green-700 rounded-lg text-green-300 flex items-center gap-2">
                <FiCheckCircle className="h-5 w-5 shrink-0" /> Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.
              </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Temukan Kami</h2>
            <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2175072463766!2d106.82493931476896!3d-6.229728695497252!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf2e5cd5e8c!2sMonas%2C%20Central%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1635500000000!5m2!1sen!2sid"
                width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" className="grayscale" title="Peta lokasi"
              />
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FiClock className="h-6 w-6 text-amber-600" /> Jam Operasional</h3>
              <div className="space-y-2 text-gray-400">
                {hours.map(([d, h]) => <div key={d} className="flex justify-between"><span>{d}</span><span className="text-white font-medium">{h}</span></div>)}
              </div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-xl font-bold text-white mb-4">Ikuti Kami</h3>
              <div className="flex gap-4">
                {socials.map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 bg-neutral-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition duration-300 border border-neutral-700">
                    <Icon className="w-6 h-6 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
