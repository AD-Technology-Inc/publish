# Skill: .agent/backend/laravel/architecture/middleware-and-requests.md

## 📌 Core Philosophy & Constraints
- **Form Request Rules**: All incoming request payloads MUST be validated via custom Form Request classes.
- **Input Sanitization**: Trim and sanitize inputs automatically before validation evaluation.
- **Custom Middleware**: Pipeline HTTP request processing using custom middleware for headers, correlation, and context.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-orders') ?? false;
    }

    public function rules(): array
    {
        return [
            'item_id' => ['required', 'uuid', 'exists:items,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'notes' => $this->notes ? trim(strip_tags($this->notes)) : null,
        ]);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Controller Validation**: Calling `$request->validate([...])` inside Controller methods.
- ❌ **Unsanitized HTML Inputs**: Allowing raw HTML markup strings into text payload fields.
- ❌ **Hardcoded `authorize() => true`**: Returning `true` blindly without checking user permissions.

## 🔍 Verification & Testing
- **Pest Validation Assertions**: Test invalid payloads asserting 422 Unprocessable Entity status and JSON validation errors.
