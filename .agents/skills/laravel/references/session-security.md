## 📌 Core Philosophy & Constraints
- **Session & Cookie Security**: Enforce `secure => true`, `http_only => true`, and `same_site => 'lax'` in `config/session.php`.
- **Redis Session Storage**: Use Redis as session driver (`SESSION_DRIVER=redis`) for high availability and quick token revocation.
- **CSRF Token Verification**: Protect stateful SPA endpoints using Laravel `VerifyCsrfToken` middleware.

## ⚡ Production Boilerplate / Standard Pattern

```php
// config/session.php configuration standards
return [
    'driver' => env('SESSION_DRIVER', 'redis'),
    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => true,
    'path' => '/',
    'domain' => env('SESSION_DOMAIN'),
    'secure' => env('SESSION_SECURE_COOKIE', true),
    'http_only' => true,
    'same_site' => 'lax',
];
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unencrypted Session Data**: Disabling session encryption (`'encrypt' => false`) for sensitive user sessions.
- ❌ **HttpOnly Disabled**: Setting `'http_only' => false` exposing session cookies to client-side XSS attacks.
- ❌ **Insecure Cookie Domain**: Misconfiguring `SESSION_DOMAIN` to wildcard domains without SSL protection.

## 🔍 Verification & Testing
- **Pest Session Test**: Assert HTTP response headers in Pest contain `Set-Cookie` with `HttpOnly; Secure; SameSite=Lax`.
