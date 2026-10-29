import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: {
    default: "Coffee Nangkau - Toko Kopi",
    template: "%s | Coffee Nangkau",
  },
  description:
    "Coffee Nangkau: kopi pilihan dari petani lokal Indonesia, diseduh barista profesional. Lihat menu, pesan, dan kunjungi kami.",
  openGraph: {
    title: "Coffee Nangkau - Toko Kopi",
    description: "Secangkir kopi untuk produktivitas yang lebih tinggi.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-sans bg-neutral-900">
        <AppProvider>
          <SiteChrome>{children}</SiteChrome>
        </AppProvider>
      </body>
    </html>
  );
}
