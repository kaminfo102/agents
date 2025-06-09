import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If token doesn't exist, redirect to login page
  if (!token) {
    const url = new URL("/", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check if user is trying to access admin routes but is not an admin
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/representative/dashboard", request.url));
  }

  // Check if user is trying to access representative routes but is not a representative
  const isRepRoute = request.nextUrl.pathname.startsWith("/representative");
  if (isRepRoute && token.role !== "REPRESENTATIVE") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Add token to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-role", token.role as string);
  requestHeaders.set("x-user-id", token.id as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/representative/:path*"],
};