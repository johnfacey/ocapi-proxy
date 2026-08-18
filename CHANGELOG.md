# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Security (High): unauthenticated single-request process crash** — [GHSA-69xg-7gfr-5vf9](https://github.com/johnfacey/ocapi-proxy/security/advisories/GHSA-69xg-7gfr-5vf9).
  A single unauthenticated request to the proxy's `/` route could crash the
  entire Node.js process. In `ProxyCall()`, the outbound request's
  success/error handler called a `callback` variable that was referenced
  before it was ever assigned, throwing an unhandled `ReferenceError` that
  took down the whole server.
  - `callback` is now defined before it is used and declared with `const`
    instead of leaking as an undeclared global.
  - Removed `chalk`-based console coloring in the same function. `chalk` is
    pinned to `^5.x`, which is ESM-only and cannot be `require()`'d from
    this CommonJS file — calling it here would have reintroduced the same
    crash via `ERR_REQUIRE_ESM`.
  - The `/` route handler now `await`s `ProxyCall()` inside a `try`/`catch`
    as defense in depth, so a future error in this path returns an HTTP 500
    instead of crashing the process.
  - No CVE has been assigned. Affected versions: through 2.2.6. See the
    advisory for full technical details.

## [2.2.7]

### Changed
- Bumped `axios` to `1.18.0`.
- Bumped `body-parser`.

## [2.2.5] and earlier

Change history prior to 2.2.6 was not tracked in this file. See the
[commit history](https://github.com/johnfacey/ocapi-proxy/commits/master)
and prior [README "Updates"](./README.md#updates) notes for earlier changes,
including the migration from `request` to `axios` and the addition of the
browser-based Proxy Testing UI.

[Unreleased]: https://github.com/johnfacey/ocapi-proxy/compare/master...HEAD
[2.2.6]: https://github.com/johnfacey/ocapi-proxy/releases/tag/2.2.6