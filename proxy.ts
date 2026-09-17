import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";
  const isPausedPage = pathname === "/store-paused";
  let authenticated = false;

  if (!isAdmin) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:4000"}/api/products/settings`, { cache: "no-store" });
      const settings = await response.json();
      if (response.ok && settings.storeStatus === "Paused" && !isPausedPage) return NextResponse.redirect(new URL("/store-paused", request.url));
      if (response.ok && settings.storeStatus !== "Paused" && isPausedPage) return NextResponse.redirect(new URL("/", request.url));
    } catch {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:4000"}/api/admin/session`, { headers: { cookie: request.headers.get("cookie") || "" }, cache: "no-store" });
    authenticated = response.ok;
  } catch { authenticated = false; }

  if (!authenticated && !isLogin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  if (authenticated && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.webp|images|uploads).*)"] };
