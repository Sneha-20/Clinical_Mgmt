import { NextResponse } from "next/server";
import {
  notToshowForPrivate,
  privateRoutes,
  routes,
} from "./lib/utils/constants/route";

export function middleware(request) {
  const token = request.cookies.get("token"); // check JWT stored in cookie

  const isPrivate = privateRoutes.includes(request.nextUrl.pathname);
  const notToShowForPrivate = notToshowForPrivate; // if user tries to access public page while logged in → redirect to dashboard
  if (isPrivate && !token) {
    return NextResponse.redirect(new URL(routes.pages.login, request.url));
  } else if (notToShowForPrivate.includes(request.nextUrl.pathname) && token) {
    return NextResponse.redirect(new URL(routes.pages.dashboard, request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
