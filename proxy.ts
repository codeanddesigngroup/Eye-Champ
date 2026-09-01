import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  let authenticated = false;

  try {
    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:4000"}/api/admin/session`, {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
    });
    authenticated = response.ok;
  } catch {
    authenticated = false;
  }

  if (!authenticated && !isLogin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (authenticated && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
