/**
 * Page-level SSR switch — single source of truth.
 *
 * Authored as CommonJS so it can be required directly by the plain-Node SSR
 * server (`server/`) and unit tests, while still being importable from the
 * webpack app bundle. Keep it free of platform globals and TS-only syntax.
 *
 * Policy: SSR is ON by default. A request whose pathname matches any deny
 * pattern is rendered CSR-only (the server serves the plain shell and the
 * browser bootstraps normally).
 *
 * Patterns are matched against the pathname WITHOUT the app base prefix
 * (e.g. `/onlinejudge3`), and work on both concrete pathnames (`/contests/123`)
 * and route patterns (`/contests/:id`) since `[^/]+` matches a numeric id and a
 * `:param` segment alike.
 */

var SSR_DEFAULT_ENABLED = true;

/**
 * Routes that must NOT be server-rendered (permission-gated, user-specific,
 * realtime, or otherwise unsuitable for anonymous SSR + URL caching).
 *
 * Note the deliberate asymmetry for contests/competitions: the *list* pages
 * (`/contests`, `/competitions`) stay SSR-enabled, while every *detail* path
 * (`/contests/:id...`, `/competitions/:id...`) is denied. `competitions-public`
 * is a distinct path and is intentionally left enabled.
 */
var SSR_DENY_PATTERNS = [
  /^\/admin(\/|$)/, // admin console
  /^\/contests\/[^/]+/, // contest detail family (bare /contests list stays ON)
  /^\/competitions\/[^/]+/, // competition detail family (/competitions list stays ON; /competitions-public unaffected)
  /^\/topics(\/|$)/, // topic pages
  /^\/solutions(\/|$)/, // solution list & detail (user-specific)
  /^\/favorites(\/|$)/, // favorites (user-specific)
  /^\/messages(\/|$)/, // messages (user-specific)
  /^\/notes(\/|$)/, // notes (user-specific)
  /^\/stats(\/|$)/, // realtime stats
  /^\/beta(\/|$)/, // experimental
  /^\/OJBK(\/|$)/, // internal
];

function normalizePathname(pathname) {
  if (!pathname) {
    return '/';
  }
  var clean = String(pathname).split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.charAt(clean.length - 1) === '/') {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

/**
 * Decide whether a given (base-stripped) pathname should be server-rendered.
 * @param {string} pathname
 * @returns {boolean}
 */
function isSSREnabledForPath(pathname) {
  if (!SSR_DEFAULT_ENABLED) {
    return false;
  }
  var p = normalizePathname(pathname);
  return !SSR_DENY_PATTERNS.some(function (re) {
    return re.test(p);
  });
}

module.exports = {
  SSR_DEFAULT_ENABLED: SSR_DEFAULT_ENABLED,
  SSR_DENY_PATTERNS: SSR_DENY_PATTERNS,
  normalizePathname: normalizePathname,
  isSSREnabledForPath: isSSREnabledForPath,
};
