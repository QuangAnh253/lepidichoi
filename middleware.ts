import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép truy cập tự do vào trang login, và trang guest
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/guest") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Kiểm tra thẻ chứng nhận (Cookie)
  const authCookie = request.cookies.get("date_auth");
  
  if (!authCookie || authCookie.value !== "true") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Áp dụng middleware cho mọi đường dẫn, ngoại trừ các file tĩnh nội bộ Next.js và các file ảnh/âm thanh/manifest
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|ico|mp3|wav|ogg)$).*)",
  ],
};
