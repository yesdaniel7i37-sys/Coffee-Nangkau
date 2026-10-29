import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import Logo from "./Logo";

const socials = [FaFacebookF, FaInstagram, FaTwitter];

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4"><Logo /></h3>
            <p className="text-sm mb-4">Menghadirkan pengalaman kopi terbaik untuk Anda sejak 2020.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-600 transition">Home</Link></li>
              <li><Link href="/tentang-kami" className="hover:text-amber-600 transition">Tentang Kami</Link></li>
              <li><Link href="/menu" className="hover:text-amber-600 transition">Menu</Link></li>
              <li><Link href="/kontak" className="hover:text-amber-600 transition">Kontak</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li>Jl. Kopi Mantap No. 123</li>
              <li>Jakarta Selatan, 12345</li>
              <li>+62 812-3456-7890</li>
              <li>info@coffeenangkau.com</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              {socials.map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-neutral-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} <span className="text-amber-600">Coffee Nangkau</span>. All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-500">Website demo untuk portofolio. Pesanan tidak diproses sungguhan.</p>
        </div>
      </div>
    </footer>
  );
}
