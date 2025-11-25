import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token"); // check JWT stored in cookie
  // console.log("Middleware token:", token);
  const publicRoutes = ["/"]; // pages allowed without login

  const isPublic = publicRoutes.includes(request.nextUrl.pathname);

  // if user tries to access public page while logged in → redirect to dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // if user tries to access private page without token → redirect to login
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico).*)"
  ],
};