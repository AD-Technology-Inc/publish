# Laravel Authentication & Sanctum Tokens

## 📌 Core Philosophy & Constraints
- **Laravel Sanctum Bearer Tokens**: Issue personal access tokens with explicit scopes and expiration limits.
- **Strict Password Hashing**: Use Argon2id or Bcrypt for password verification (`Hash::check()`).

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class IssueSanctumTokenAction
{
    public function execute(string $email, string $password, string $deviceName): string
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are invalid.'],
            ]);
        }

        return $user->createToken(
            name: $deviceName,
            abilities: ['orders:read', 'orders:create'],
            expiresAt: now()->addHours(2)
        )->plainTextToken;
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unexpiring Sanctum Tokens**: Issuing access tokens without setting `expiresAt` or config expiration limits.
- ❌ **Wildcard Abilities**: Assigning `['*']` abilities to tokens when granular scopes exist.
