import MenuClient from "@/components/MenuClient";
import { getMenu } from "@/lib/db";

// Selalu ambil menu terbaru dari database (harga, stok habis, menu baru dari admin)
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const items = await getMenu();
  return <MenuClient items={items} />;
}
