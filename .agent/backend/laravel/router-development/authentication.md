# Skill: .agent/backend/laravel/router-development/authentication.md

## 📌 Core Philosophy & Constraints
- **Sanctum Token Guard**: Use `auth:sanctum` middleware for API authentication.
- **Request User Injection**: Access authenticated user instance via `$request->user()`.
- **Token Scope Capabilities**: Validate Sanctum token permissions using `$user->tokenCan('read')`.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use ValidationException;

final class LoginController
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token', ['orders:create', 'orders:read'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ]);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Storing Raw Passwords**: Comparing unhashed plain passwords with database records.
- ❌ **Unscoped Tokens**: Creating Sanctum tokens with wildcard `['*']` capabilities for low-privilege clients.
- ❌ **Global Unprotected Routes**: Exposing private API endpoints without `auth:sanctum` middleware protection.

## 🔍 Verification & Testing
- **Pest Sanctum Test**: Use `Sanctum::actingAs($user)` in Pest tests asserting 200 OK authenticated response.
