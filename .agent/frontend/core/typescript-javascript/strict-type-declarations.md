# Skill: .agent/frontend/core/typescript-javascript/strict-type-declarations.md

## 📌 Core Philosophy & Constraints
- **Strict Null Checks**: `strict: true` in `tsconfig.json`. `any` type is strictly forbidden.
- **Generics & Utility Types**: Use `Pick`, `Omit`, `Partial`, `Readonly`, and discriminate unions for dynamic data.
- **Type Guards**: Use explicit type predicates (`is`) for runtime validation.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// Strict Discriminated Union & Generic Response Wrapper
export type ApiSuccess<T> = {
  status: 'success';
  data: T;
  timestamp: string;
};

export type ApiError = {
  status: 'error';
  message: string;
  code: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type Guard
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.status === 'success';
}

// Usage with strict utility types
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export type UpdateUserPayload = Partial<Omit<UserProfile, 'id' | 'createdAt'>>;
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Using `any`**: Defeating static analysis with `any` instead of `unknown` or generics.
- ❌ **Type Assertions (`as`) Overuse**: Bypassing compiler checks using `as TargetType` without runtime validation.
- ❌ **Implicit Any in Parameters**: Omitting parameter types in functions or arrow callbacks.

## 🔍 Verification & Testing
- **TSC Check**: Run `tsc --noEmit` asserting zero type compilation errors.
