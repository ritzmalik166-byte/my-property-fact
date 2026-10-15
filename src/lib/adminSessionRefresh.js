import { getPublicApiBase } from "./publicApiBase";
import { isMpfBackendUrl } from "./apiAuth";

/**
 * Silent admin access-token refresh for the dashboard.
 *
 * Admin auth lives in HttpOnly `token` / `refreshToken` cookies set by the API. When the
 * 24h access token lapses, dashboard calls fail with 401 (URL rules) or 403 (@PreAuthorize).
 * We ask the API to mint a new `token` cookie from `refreshToken` and replay the request once.
 */

const REFRESH_PATH = "admin-portal/auth/refresh-token";
const SESSION_PATH = "admin-portal/auth/session";
const NO_REFRESH_PATHS = [
  "admin-portal/auth/login",
  "admin-portal/auth/logout",
  "admin-portal/auth/refresh",
];
/** After a successful refresh, a 401/403 on a newer request is a real denial, not an expired token. */
const FRESH_TOKEN_WINDOW_MS = 30_000;

let inflightRefresh = null;
let lastRefreshAt = 0;
let redirectingToLogin = false;

function isAdminDashboardPage() {
  return (
    typeof window !== "undefined" &&
    /^\/admin\/dashboard(\/|$)/.test(window.location.pathname)
  );
}

function isSameOriginAdminRoute(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      parsed.pathname.startsWith("/api/admin/")
    );
  } catch {
    return false;
  }
}

/** Whether a failed request to `url` may be recovered by refreshing the admin session. */
export function isAdminRefreshCandidate(url) {
  if (!url || !isAdminDashboardPage()) return false;
  const value = String(url);
  if (NO_REFRESH_PATHS.some((p) => value.includes(p))) return false;
  return isMpfBackendUrl(value) || isSameOriginAdminRoute(value);
}

export function isAuthFailureStatus(status) {
  return status === 401 || status === 403;
}

async function sessionIsGone(fetchImpl, apiBase) {
  try {
    const res = await fetchImpl(`${apiBase}${SESSION_PATH}`, {
      credentials: "include",
      cache: "no-store",
    });
    return res.status === 401;
  } catch {
    return false;
  }
}

function redirectToAdminLogin() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  window.location.assign("/admin");
}

function refreshAdminSession(fetchImpl) {
  if (inflightRefresh) return inflightRefresh;
  const apiBase = getPublicApiBase();
  if (!apiBase) return Promise.resolve(false);

  inflightRefresh = (async () => {
    try {
      const res = await fetchImpl(`${apiBase}${REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        lastRefreshAt = Date.now();
        return true;
      }
      if (res.status === 401 && (await sessionIsGone(fetchImpl, apiBase))) {
        redirectToAdminLogin();
      }
      return false;
    } catch {
      return false;
    } finally {
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}

/**
 * Resolves true when the caller should replay its request (a refresh completed after the
 * request was sent). Concurrent callers share one refresh request.
 */
export function recoverAdminSession(requestStartedAt, fetchImpl) {
  if (inflightRefresh) return inflightRefresh;
  if (lastRefreshAt > requestStartedAt) return Promise.resolve(true);
  if (Date.now() - lastRefreshAt < FRESH_TOKEN_WINDOW_MS) return Promise.resolve(false);
  return refreshAdminSession(fetchImpl);
}
