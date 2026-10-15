import { NextResponse } from "next/server";
import { canAccessAdminPath } from "./app/(adminside)/admin/adminPermissions";
import { getPublicApiBase } from "./lib/publicApiBase";
import { reportIpTrackHit } from "./lib/reportIpTrackHit";
import { ELDECO_LANDING_BASE_PATH, ELDECO_PAGE_PATH } from "./components/eldecoPaths";
import {
  isDefinitelyInvalidPublicPath,
  NOT_FOUND_TRIGGER_PATH,
} from "./lib/publicRouteValidation";

const protectedRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/settings",
  "/portal",
  "/portal/dashboard",
];

function buildCookieHeader(req) {
  try {
    const all = req.cookies.getAll();
    if (!all?.length) return req.headers.get("cookie") || "";
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return req.headers.get("cookie") || "";
  }
}

function readSetCookies(res) {
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie();
  }
  const raw = res.headers.get("set-cookie");
  return raw ? raw.split(/,\s*(?=[^;,\s]+=)/) : [];
}

function withCookie(cookieHeader, name, value) {
  const parts = cookieHeader
    .split(/;\s*/)
    .filter((part) => part && !part.startsWith(`${name}=`));
  parts.push(`${name}=${value}`);
  return parts.join("; ");
}

// Mint a new access token from the refreshToken cookie (access token lapses before the refresh token).
async function refreshAccessToken(req, apiBase, cookieHeader) {
  if (!req.cookies.get("refreshToken")?.value) return null;
  try {
    const res = await fetch(`${apiBase}admin-portal/auth/refresh-token`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const token = data.token || data.accessToken;
    if (!token) return null;
    return {
      setCookies: readSetCookies(res),
      cookieHeader: withCookie(cookieHeader, "token", token),
    };
  } catch (err) {
    console.error("refreshAccessToken error:", err);
    return null;
  }
}

// checking session validity and extracting roles
async function checkSession(req, { allowRefresh = false } = {}) {
  const apiBase = getPublicApiBase();
  if (!apiBase) {
    return { valid: false };
  }
  const cookieHeader = buildCookieHeader(req);
  const session = await fetchSession(apiBase, cookieHeader);
  if (session.valid || !allowRefresh) return session;

  const refreshed = await refreshAccessToken(req, apiBase, cookieHeader);
  if (!refreshed) return session;
  const retried = await fetchSession(apiBase, refreshed.cookieHeader);
  return retried.valid ? { ...retried, refreshed } : retried;
}

/** Forward refreshed auth cookies to the browser. */
function withSessionCookies(response, session) {
  session?.refreshed?.setCookies.forEach((cookie) =>
    response.headers.append("Set-Cookie", cookie),
  );
  return response;
}

/** Continue the request; server components must also see the refreshed token this render. */
function nextWithSession(req, session) {
  if (!session?.refreshed) return NextResponse.next();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("cookie", session.refreshed.cookieHeader);
  return withSessionCookies(
    NextResponse.next({ request: { headers: requestHeaders } }),
    session,
  );
}

async function fetchSession(apiBase, cookieHeader) {
  try {
    const res = await fetch(`${apiBase}admin-portal/auth/session`, {
      headers: {
        Cookie: cookieHeader || "",
      },
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return { valid: false };
    }
    if (!res.ok) return { valid: false };
    // Session expiry: backend sends expiresAt in response body (ISO string)
    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
        return { valid: false };
      }
    }
    return {
      valid: true,
      roles: data.roles || [],
      permissions: data.permissions || [],
      email: data.email,
    };
  } catch (err) {
    console.error("checkSession error:", err);
    return { valid: false };
  }
}

// Helper function to check if user has required role
function hasRole(roles, requiredRole) {
  if (!roles || !Array.isArray(roles)) return false;

  const normalizedRequired = requiredRole.toUpperCase();

  return roles.some((role) => {
    if (!role) return false;
    const normalizedRole = role.toUpperCase();
    return (
      normalizedRole === normalizedRequired ||
      normalizedRole === `ROLE_${normalizedRequired}`
    );
  });
}

/** Super Admin or Admin may use /admin dashboard (not portal User). */
function hasAdminDashboardAccess(roles) {
  return hasRole(roles, "SUPERADMIN") || hasRole(roles, "ADMIN");
}

function isEldecoTerraSolPath(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // keep raw pathname
  }
  return [ELDECO_PAGE_PATH, ELDECO_LANDING_BASE_PATH].some((base) => {
    const decodedBase = decodeURIComponent(base);
    return decoded === decodedBase || decoded.startsWith(`${decodedBase}/`);
  });
}

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // Track scanners / probe paths before any rewrite (bots rarely run JS).
  reportIpTrackHit(req, path);

  if (
    path !== NOT_FOUND_TRIGGER_PATH &&
    isDefinitelyInvalidPublicPath(path)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = NOT_FOUND_TRIGGER_PATH;
    return NextResponse.rewrite(url);
  }

  if (isEldecoTerraSolPath(path)) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-mpf-hide-popular-promo", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public registration removed — only Super Admin creates users from the dashboard
  if (path === "/admin/register" || path === "/admin/register/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (
    path === "/admin/forgot-password" ||
    path === "/admin/forgot-password/"
  ) {
    return NextResponse.next();
  }

  // Special case: login page
  if (path === "/admin") {
    // Check if accessDenied query parameter is already present
    const accessDenied = req.nextUrl.searchParams.get("accessDenied");

    const session = await checkSession(req, { allowRefresh: true });
    if (session.valid) {
      if (hasAdminDashboardAccess(session.roles)) {
        return withSessionCookies(
          NextResponse.redirect(new URL("/admin/dashboard", req.url)),
          session,
        );
      }
      // Logged in but wrong role
      if (accessDenied === "true") {
        return nextWithSession(req, session); // allow page to show toast
      }
      return withSessionCookies(
        NextResponse.redirect(new URL("/admin?accessDenied=true", req.url)),
        session,
      );
    }
    return NextResponse.next();
  }

  // Special case: portal root (signin page)
  if (path === "/portal" || path === "/portal/") {
    const session = await checkSession(req);

    if (session.valid) {
      if (
        (hasRole(session.roles, "USER") || hasRole(session.roles, "BROKER") || hasRole(session.roles, "OWNER")) &&
        !hasRole(session.roles, "SUPERADMIN")
      ) {
        return NextResponse.redirect(new URL("/portal/dashboard", req.url));
      }

      // SUPERADMIN trying to access portal
      // if (hasRole(session.roles, "SUPERADMIN")) {
      //   return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      // }
    }
    return NextResponse.next();
  }
  // Protect admin and portal routes (except /portal which is the signin page)
  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    path !== "/portal" &&
    path !== "/portal/"
  ) {
    const isAdminRoute = path.startsWith("/admin");
    const isPortalRoute = path.startsWith("/portal");
    const session = await checkSession(req, { allowRefresh: isAdminRoute });

    if (!session.valid) {
      const redirectTo = isPortalRoute ? "/portal" : "/admin";

      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // ---- ROLE BASED ACCESS ----
    if (isAdminRoute) {
      if (!hasAdminDashboardAccess(session.roles)) {
        return withSessionCookies(
          NextResponse.redirect(new URL("/portal", req.url)),
          session,
        );
      }
      if (
        path.startsWith("/admin/dashboard") &&
        path !== "/admin/dashboard" &&
        path !== "/admin/dashboard/"
      ) {
        const gate = canAccessAdminPath(
          session.roles,
          session.permissions,
          path,
        );
        if (!gate.ok && gate.redirect) {
          return withSessionCookies(
            NextResponse.redirect(new URL(gate.redirect, req.url)),
            session,
          );
        }
      }
    }

    if (isPortalRoute) {
      if (!hasRole(session.roles, "USER") && !hasRole(session.roles, "BROKER") && !hasRole(session.roles, "OWNER")) {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    }
    // All good → allow request
    return nextWithSession(req, session);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/Eldeco-terra&sol",
    "/Eldeco-terra&sol/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|txt|xml|json|map)$).*)",
  ],
};
