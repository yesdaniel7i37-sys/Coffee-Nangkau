import Link from "next/link";
import Image from "next/image";
import { FiArrowDown, FiCheck } from "react-icons/fi";
import Reveal from "@/components/Reveal";
import { getMenuByIds } from "@/lib/db";
import { rupiah } from "@/lib/format";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

const stats = [
  ["500+", "Pelanggan Setia"],
  ["50+", "Menu Pilihan"],
  ["5+", "Tahun Pengalaman"],
  ["4.9", "Rating Pelanggan"],
];

const reasons = [
  ["100% Biji Kopi Premium", "Dipilih langsung dari perkebunan terbaik"],
  ["Barista Profesional", "Dengan pengalaman lebih dari 5 tahun"],
  ["Suasana Nyaman", "Tempat sempurna untuk bekerja dan bersantai"],
];

const steps = [
  ["Pilih Biji", "Seleksi biji kopi premium terbaik"],
  ["Roasting", "Panggang dengan suhu sempurna"],
  ["Brewing", "Seduh dengan teknik profesional"],
  ["Sajikan", "Nikmati kopi sempurna Anda"],
];

const testimonials = [
  {
    name: "Budi Santoso",
    text: "Kopi terbaik yang pernah saya coba! Suasana tempatnya juga sangat nyaman untuk bekerja.",
  },
  {
    name: "Siti Nurhaliza",
    text: "Cappuccino-nya enak banget! Baristanya juga ramah dan profesional.",
  },
  {
    name: "Ahmad Wijaya",
    text: "Tempat favorit saya untuk meeting. Kopinya selalu konsisten enak!",
  },
];

function SectionTitle({ a, b, sub }) {
  return (
    <Reveal className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
        {a} <span className="text-amber-600">{b}</span>
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto">{sub}</p>
    </Reveal>
  );
}

export default async function Home() {
  const featured = await getMenuByIds(["cappuccino", "mocha", "caramel-macchiato"]);
  return (
    <main>
      {/* Hero */}
      <section
        id="home"
        className="relative h-screen bg-cover bg-center parallax"
        style={{ backgroundImage: "url('/Assets/coffeebg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative z-10 flex items-center h-full px-6 md:px-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-2xl">
              <Reveal
                as="h1"
                type="left"
                className="text-white text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                Mari Nikmati
                <br />
                Secangkir <span className="text-amber-600">Kopi</span>
              </Reveal>
              <Reveal
                as="p"
                type="left"
                delay={0.2}
                className="text-gray-300 text-sm md:text-lg mb-8 max-w-md"
              >
                Secangkir kopi untuk produktivitas yang lebih tinggi.
              </Reveal>
              <Reveal type="left" delay={0.4} className="inline-block">
                <Link
                  href="/menu"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md text-sm md:text-base font-medium transition duration-300 transform hover:scale-105"
                >
                  Beli Sekarang
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <FiArrowDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <SectionTitle
            a="Menu"
            b="Favorit"
            sub="Pilihan kopi terbaik yang paling digemari pelanggan kami"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map(
              (p, i) =>
                p && (
                  <Reveal
                    key={p.id}
                    delay={i * 0.2}
                    className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-600/20 transition duration-300 transform hover:-translate-y-2 border border-neutral-700"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-amber-400 to-amber-600">
                      <Image
                        src={p.img}
                        alt={p.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {p.name}
                      </h3>
                      <p className="text-gray-400 mb-4">{p.desc}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-amber-600">
                          {rupiah(p.price)}
                        </span>
                        <Link
                          href="/menu"
                          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
                        >
                          Pesan
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                )
            )}
          </div>
          <Reveal className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-3 rounded-md font-medium transition duration-300"
            >
              Lihat Semua Menu
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-4 gap-8 text-center">
          {stats.map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.1}>
              <div className="text-5xl font-bold text-amber-600 mb-2">{n}</div>
              <p className="text-gray-400">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">
  <Reveal type="left">
    <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl">
      <Image
        src="/Assets/Foto_kedai.jpg"
        alt="Suasana kedai Coffee Nangkau"
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  </Reveal>
  <Reveal type="right">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
      Kenapa Memilih <span className="text-amber-600">Coffee Nangkau?</span>
    </h2>
    <p className="text-gray-400 mb-6 leading-relaxed">
      Kami menghadirkan pengalaman kopi terbaik dengan biji kopi pilihan dari
      petani lokal Indonesia. Setiap cangkir diseduh dengan penuh cinta dan
      perhatian.
    </p>
    <ul className="space-y-4">
      {reasons.map(([t, d]) => (
        <li key={t} className="flex items-start">
          <FiCheck className="h-6 w-6 text-amber-600 mr-3 shrink-0" />
          <div>
            <h3 className="text-white font-semibold mb-1">{t}</h3>
            <p className="text-gray-400 text-sm">{d}</p>
          </div>
        </li>
      ))}
    </ul>
    <Link
      href="/tentang-kami"
      className="inline-block mt-8 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-md font-medium transition duration-300"
    >
      Pelajari Lebih Lanjut
    </Link>
  </Reveal>
</div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <SectionTitle
            a="Proses"
            b="Penyajian"
            sub="Dari biji kopi hingga secangkir sempurna di tangan Anda"
          />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.2} className="text-center">
                <div
                  className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 float-animation"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <span className="text-white text-3xl font-bold">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t}</h3>
                <p className="text-gray-400 text-sm">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <SectionTitle
            a="Kata"
            b="Pelanggan"
            sub="Apa yang mereka katakan tentang Coffee Nangkau"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 0.2}
                className="bg-neutral-800 rounded-xl p-8 border border-neutral-700"
              >
                <div className="flex items-center mb-4">
                  <Avatar name={t.name} index={i} className="w-12 h-12 mr-4" />
                  <div>
                    <h4 className="text-white font-semibold">{t.name}</h4>
                    <div className="text-amber-600">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-400 italic">&ldquo;{t.text}&rdquo;</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-700">
        <Reveal className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Siap Menikmati Kopi Terbaik?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Kunjungi kami sekarang dan rasakan pengalaman kopi yang tak terlupakan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-md font-semibold transition duration-300 transform hover:scale-105"
            >
              Lihat Menu
            </Link>
            <Link
              href="/kontak"
              className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-md font-semibold transition duration-300 transform hover:scale-105"
            >
              Hubungi Kami
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}