import Link from "next/link";
import Image from "next/image";
import { FiCheck, FiUsers, FiGlobe } from "react-icons/fi";
import Avatar from "@/components/Avatar";

export const metadata = { title: "Tentang Kami" };

const values = [
  { Icon: FiCheck, title: "Kualitas Terbaik", text: "Kami hanya menggunakan biji kopi pilihan dari perkebunan terbaik di Indonesia untuk menghasilkan cita rasa yang sempurna." },
  { Icon: FiUsers, title: "Komunitas", text: "Kami membangun ruang yang nyaman untuk berkumpul, berbagi cerita, dan menciptakan kenangan bersama." },
  { Icon: FiGlobe, title: "Keberlanjutan", text: "Kami mendukung petani lokal dan berkomitmen pada praktik ramah lingkungan dalam setiap aspek bisnis kami." },
];

const team = [
  { name: "Budi Santoso", role: "Head Barista", desc: "Ahli dalam seni latte dan brewing manual" },
  { name: "Siti Nurhaliza", role: "Coffee Sourcing", desc: "Spesialis pemilihan biji kopi berkualitas" },
  { name: "Ahmad Wijaya", role: "Roaster Master", desc: "Pengalaman 10 tahun dalam roasting" },
  { name: "Dewi Lestari", role: "Store Manager", desc: "Memastikan pengalaman terbaik pelanggan" },
];

function Heading({ title, sub }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-400 max-w-2xl mx-auto">{sub}</p>
    </div>
  );
}

export default function TentangKamiPage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-neutral-800 to-neutral-900 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Tentang <span className="text-amber-600">Kami</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Perjalanan kami dalam menghadirkan secangkir kopi terbaik untuk Anda
        </p>
      </section>

      {/* Cerita */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Cerita Kami</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Coffee Nangkau lahir dari kecintaan kami terhadap kopi berkualitas dan keinginan untuk menciptakan ruang hangat bagi semua orang. Sejak 2020, kami berkomitmen menyajikan kopi pilihan dari petani lokal Indonesia.
            </p>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Setiap cangkir yang kami sajikan adalah hasil dari proses seleksi biji kopi terbaik, pemanggangan sempurna, dan penyeduhan dengan penuh cinta. Kami percaya bahwa kopi bukan hanya minuman, tetapi pengalaman yang menghubungkan orang-orang.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Di Coffee Nangkau, kami tidak hanya menjual kopi, tetapi menciptakan kenangan indah di setiap tegukan.
            </p>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-neutral-700">
            <Image
              src="/Assets/Foto_Kedai.jpg"
              alt="Suasana kedai Coffee Nangkau"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nilai */}
      <section className="py-16 bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <Heading
            title="Nilai-Nilai Kami"
            sub="Prinsip yang kami pegang teguh dalam setiap langkah perjalanan kami"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {values.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="bg-neutral-900 rounded-xl p-8 shadow-lg hover:shadow-2xl hover:shadow-amber-600/20 transition border border-neutral-700"
              >
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mb-6">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digiling Segar */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 md:order-1">
            <Image
              src="/Assets/Roasting.jpg"
              alt="Penggiling kopi dan biji kopi"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Digiling Segar</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Aroma kopi paling kuat sesaat setelah digiling. Karena itu kami menggiling biji kopi sesuai pesanan, supaya rasa dan wanginya tetap utuh sampai ke cangkir Anda.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Hasilnya, secangkir kopi yang konsisten di setiap kunjungan Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Tim */}
      <section className="py-16 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <Heading
            title="Tim Kami"
            sub="Orang-orang di balik secangkir kopi terbaik Anda"
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((m, i) => (
              <div key={m.name} className="text-center">
                <Avatar
                  name={m.name}
                  index={i}
                  className="w-40 h-40 text-5xl mx-auto mb-4 shadow-lg border-4 border-neutral-700"
                />
                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                <p className="text-amber-600 font-medium mb-2">{m.role}</p>
                <p className="text-gray-400 text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black text-white border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mari Bergabung dengan Kami</h2>
          <p className="text-gray-300 mb-8">
            Kunjungi kedai kami dan rasakan pengalaman kopi yang berbeda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md font-medium transition duration-300"
            >
              Lihat Menu
            </Link>
            <Link
              href="/kontak"
              className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-md font-medium transition duration-300"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}