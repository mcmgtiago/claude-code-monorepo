import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const publicPagePaths = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/blocked"]);
const publicApiPaths = new Set(["/api/superuser/platform/logo"]);

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname.includes(".");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicApiRequest = publicApiPaths.has(pathname) && request.method === "GET";

  if (isStaticAsset(pathname) || pathname.startsWith("/api/auth/") || isPublicApiRequest) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublicPage = publicPagePaths.has(pathname);
  const isApiRequest = pathname.startsWith("/api/");

  if (!session && isPublicPage) {
    return NextResponse.next();
  }

  if (!session && isApiRequest) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPage) {
    if (pathname === "/blocked") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
