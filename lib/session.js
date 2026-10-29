import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./auth";

// Mengembalikan data sesi admin, atau null kalau belum login
export async function getSession() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}
