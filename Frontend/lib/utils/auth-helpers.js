import { roleRoutesAccess } from "./constants/route";

/**
 * Decode JWT token and extract user information
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Extract role from localStorage (you may want to validate this from token too)
 */
export function getUserRoleFromLocalStorage() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userRole");
}

/**
 * Map backend role names to sidebar role names
 */
export function mapBackendRoleToSidebarRole(backendRole) {
  if (!backendRole) return null;

  const roleMap = {
    Audiologist: "Audiologist",
    "Audiologist & Speech Therapist": "Audiologist",
    "Audiologist & Speech": "Audiologist",
    Speech: "Speech Therapist",
    "Speech Therapist": "Speech Therapist",
    "Clinic Manager": "Clinic Manager",
    Admin: "Admin",
    Reception: "Reception",
    Receptionist: "Reception",
  };

  return roleMap[backendRole] || backendRole;
}

/**
 * Check if user has access to a specific route based on their role
 */
export function hasAccessToRoute(role, pathname) {
  if (!role || !pathname) return false;

  const allowedRoutes = roleRoutesAccess[role];
  if (!allowedRoutes) return false;

  // Check if pathname matches any allowed route
  return allowedRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Get all allowed routes for a specific role
 */
export function getAllowedRoutesForRole(role) {
  return roleRoutesAccess[role] || [];
}

/**
 * Check if a route requires authentication
 */
export function isPrivateRoute(pathname) {
  const privateRoutes = [
    "/dashboard",
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/case-history",
    "/dashboard/patient/visit-details",
    "/dashboard/receptionist/followup-list",
    "/dashboard/tga-service",
    "/dashboard/pending-item",
    "/dashboard/inventory",
    "/dashboard/billing",
    "/dashboard/trials",
    "/dashboard/referal-doctor",
    "/dashboard/awaiting-device",
    "/dashboard/analytics",
    "/dashboard/transfer-products",
  ];

  return privateRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Check if a route is public accessible
 */
export function isPublicRoute(pathname) {
  const publicRoutes = [
    "/",
    "/about",
    "/login",
    "/signup",
    "/services",
    "/offers",
  ];

  return publicRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}
