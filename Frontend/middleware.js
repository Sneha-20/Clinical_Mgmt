import { NextResponse } from "next/server";
import {
  notToshowForPrivate,
  privateRoutes,
  publicRoutes,
  roleRoutesAccess,
  routes,
} from "./lib/utils/constants/route";

// Helper function to check if a route matches a pattern
function routeMatches(pathname, routePattern) {
  if (routePattern === pathname) return true;
  // Handle routes with dynamic segments
  if (pathname.startsWith(routePattern + "/")) return true;
  return false;
}

// Helper function to get user role from token (JWT)
function extractRoleFromToken(tokenString) {
  try {
    if (!tokenString) return null;
    // Parse JWT token (payload is the second part)
    const parts = tokenString.split(".");
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded.role || decoded.user_role || null;
  } catch (error) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get("token")?.value; // Get JWT token from cookie
  const pathname = request.nextUrl.pathname;

  // Check if route is private
  const isPrivateRoute = privateRoutes.some((route) =>
    routeMatches(pathname, route)
  );

  // Check if route should be hidden when logged in
  const shouldHideWhenLoggedIn = notToshowForPrivate.some((route) =>
    routeMatches(pathname, route)
  );

  // No token - redirect to login for private routes
  if (isPrivateRoute && !token) {
    return NextResponse.redirect(new URL(routes.pages.login, request.url));
  }

  // Has token but trying to access public auth pages - redirect to dashboard
  if (shouldHideWhenLoggedIn && token) {
    return NextResponse.redirect(new URL(routes.pages.dashboard, request.url));
  }

  // If user is authenticated but attempts to visit any non-dashboard page,
  // treat it as public and bounce them back. This covers pages outside of
  // the /dashboard folder (e.g., home, services, about, etc.).
  if (token && !pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(routes.pages.dashboard, request.url));
  }

  // Validate role-based access for dashboard routes
  if (isPrivateRoute && token) {
    // Extract role from token
    let userRole = null;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const decoded = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8")
        );
        // Map backend role to sidebar role
        const backendRole = decoded.role || decoded.user_role || "";
        if (
          backendRole === "Audiologist" ||
          backendRole === "Speech" ||
          backendRole === "Audiologist & Speech Therapist"
        ) {
          userRole = "Audiologist";
        } else if (backendRole === "Clinic Manager") {
          userRole = "Clinic Manager";
        } else if (backendRole === "Admin") {
          userRole = "Admin";
        } else if (backendRole === "Reception" || backendRole === "Receptionist") {
          userRole = "Reception";
        } else {
          userRole = backendRole;
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }

    // Check role-based access
    if (userRole && roleRoutesAccess[userRole]) {
      const allowedRoutes = roleRoutesAccess[userRole];
      const hasAccess = allowedRoutes.some((route) => routeMatches(pathname, route));

      // If user doesn't have access to this route, redirect to dashboard
      if (!hasAccess) {
        return NextResponse.redirect(new URL(routes.pages.dashboard, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|public).*)"],
};
