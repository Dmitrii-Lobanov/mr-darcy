# Authentication and authorization rules

## Scope

Epic 3 adds customer registration, login, current-user lookup,
logout, and backend authentication and role enforcement.

Public workshop browsing remains available without signing in.

Authentication sessions are distinct from workshop sessions.
Use the name AuthSession for authentication persistence.

Email verification, password reset, MFA, and booking ownership
implementation are outside this epic.
These rules do not establish production readiness.

## Email identity

Registration and login trim surrounding email whitespace
and lowercase the entire address before validation and lookup.

Only ASCII email addresses are supported in this epic.
The normalized address must be syntactically valid and no
longer than 254 characters.

Dots and plus suffixes are preserved.
For example, ada+work@example.com and ada@example.com
are different application identities.

The database enforces unique normalized email addresses,
including when registration requests arrive concurrently.

An email address is an account identifier.
Registration does not prove ownership of that mailbox.

## Passwords

Passwords must contain between 15 and 128 Unicode code points.

Spaces and Unicode characters are allowed.
Uppercase, digits, and symbols are not individually required.

Passwords are never trimmed, lowercased, normalized,
or silently truncated.

Store only salted Argon2id password hashes.
Never log passwords or return password hashes.

## Registration

Public registration accepts only email and password.
Unexpected fields, including role and user ID, are rejected.

Every publicly registered account has the customer role.

Successful registration returns HTTP 201 and a public user.
It does not create a login session.

Invalid input returns HTTP 400.
An existing normalized email returns HTTP 409.

The duplicate-email response reveals account existence.
This is an explicit initial-scope tradeoff.

## Login and authentication sessions

Login uses the same email normalization as registration.

An unknown email and an incorrect password return the same
HTTP 401 response: "Invalid email or password."

Successful login creates a fresh cryptographically random
opaque token with at least 256 bits of randomness.

Store only its SHA-256 hash in PostgreSQL.
The raw token is delivered only through the session cookie,
never in a JSON response, URL, or log.

An authentication session expires seven days after creation.
Activity does not extend its expiry.
Multiple independently created sessions are allowed.

The backend accepts a session only when:

- Its token matches a stored hash.
- It has not been revoked.
- Its user still exists.
- Its expiry is later than the database decision time.

At expires_at <= decision_time, the session is invalid.
Expired rows need not be deleted before access is denied.

Registration and login are rate-limited.
Exceeding a limit returns HTTP 429.
Exact limits and testable enforcement are defined before
these endpoints are considered complete.

## Cookies and browser transport

The browser calls authentication endpoints through the
Next.js application's origin.

The session cookie uses HttpOnly, SameSite=Lax, and Path=/.
It has no Domain attribute.
Its lifetime does not exceed the server-side session lifetime.

HTTPS deployments require Secure.
Local HTTP development may omit Secure.

Do not store authentication tokens in localStorage.

Authenticated responses must not enter shared caches.

## Logout

Logout uses POST and revokes the presented session in PostgreSQL
before reporting success. It also clears the browser cookie.

After successful logout, replaying that token is unauthorized.
Other independently created sessions remain valid.

With valid CSRF checks, logout without a valid session still
clears the cookie and returns HTTP 204.

Repeated logout is harmless.
A database failure must not be reported as successful revocation.

## Identity and roles

Public user responses expose only id, email, and role.
Password hashes and authentication-session records stay private.

Current-user lookup returns the public user for a valid session.
Missing, invalid, expired, or revoked credentials return HTTP 401.

Roles are customer and organizer.

The backend loads identity and the current role from trusted
database records. Request bodies and frontend state cannot
assign identity or grant permissions.

A valid customer session accessing an organizer-only operation
receives HTTP 403.

Organizer accounts are provisioned through an explicit local
administrative command. There is no public role-change endpoint.

Booking ownership checks will be implemented in the booking epic,
following booking-rules.md.

## CSRF protection

GET and HEAD requests must not change application state.

Browser mutations, including registration, login, and logout,
require both:

- An Origin exactly matching the configured web origin.
- The custom request header X-Mr-Darcy-CSRF: 1.

Missing, null, or mismatched Origin values and missing or invalid
custom headers return HTTP 403 before mutation.

The header is a browser request marker, not an authentication secret.

The Next.js forwarding layer preserves the original Origin and
header. It must not manufacture them for an untrusted request.
The API enforces these checks.

Cross-origin credentialed access is not enabled.
SameSite cookies supplement these checks rather than replace them.

## Acceptance criteria

- Public catalog and workshop details work without authentication.
- Email case and surrounding whitespace identify the same account.
- Concurrent duplicate registration creates at most one user.
- Registration cannot assign organizer privileges.
- Passwords are preserved exactly and stored only as hashes.
- Unknown email and wrong password produce identical login errors.
- Successful login creates a fresh token and survives page refresh.
- Missing, invalid, expired, and revoked sessions receive HTTP 401.
- A session is invalid at its exact expiry instant.
- Successful logout prevents subsequent token replay.
- Customer access to an organizer-only operation receives HTTP 403.
- Cross-site and missing-CSRF-header mutations are rejected.
- Registration and login limits produce HTTP 429 when exceeded.
- Public payloads contain no password hashes or token hashes.
