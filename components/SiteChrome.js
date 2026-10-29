"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import PaymentModal from "./PaymentModal";
import ScrollTopButton from "./ScrollTopButton";
import ChatWidget from "./ChatWidget";

// Navbar, footer, dan keranjang hanya untuk website; halaman /admin tampil polos.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CartSidebar />
      <PaymentModal />
      <ScrollTopButton />
      <ChatWidget />
    </>
  );
}
