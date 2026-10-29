import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(COOKIE)?.value);
  const isLogin = pathname === "/admin/login";

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
