# Skill: .agent/frontend/react/SKILL.md

# React 19 & React Router v8+ Frontend Architecture Skill Registry

This document serves as the decision matrix and component pattern reference for AI agents building modern, high-performance web applications using React 19+ and React Router v8+.

---

## 🛠️ Tech Stack & Version Manifest

- **Core Library**: React 19+ (Hooks, Functional Components, Concurrent Rendering)
- **Routing Engine**: React Router v8+ Data Routers (`createBrowserRouter`, `RouterProvider`)
- **Type System**: TypeScript 5.x (Strict Type Declarations, Zero `any`)
- **Forms & Validation**: React Hook Form 7.x + Zod 3.x (`@hookform/resolvers/zod`)
- **UI Components & Styling**: Shadcn UI + Radix UI Primitives + Tailwind CSS 3.x / 4.x
- **HTTP Client**: Axios 1.x (Request/Response Interceptors, Circuit Breaker)
- **Testing Tools**: Vitest 3.x + `@testing-library/react` 16.x + Playwright 1.x

---

## 🔗 Sub-Skill Deep Dive References

- ⚛️ **Functional Components**: [functional-components.md](./architecture/functional-components.md)
- 🪝 **Custom Hooks**: [custom-hooks.md](./architecture/custom-hooks.md)
- 🧩 **Component Design**: [component-design.md](./architecture/component-design.md)
- 💾 **Local & Global State**: [local-global-state.md](./state-and-data/local-global-state.md)
- 🌐 **Axios API Client**: [axios-api-client.md](./state-and-data/axios-api-client.md)
- 🗺️ **React Router v8+**: [react-router.md](./router-development/react-router.md)
- 🛡️ **Navigation & Guards**: [navigation-and-guards.md](./router-development/navigation-and-guards.md)
- 📝 **React Hook Form & Zod**: [react-hook-form-zod.md](./forms-and-validation/react-hook-form-zod.md)
- 🎨 **Shadcn UI**: [shadcn-ui.md](./UI-and-styling/shadcn-ui.md)
- 🧪 **Vitest Testing Library**: [vitest-testing-library.md](./testing-and-perf/vitest-testing-library.md)
- 🎭 **Playwright E2E**: [playwright.md](./testing-and-perf/playwright.md)
- ⚡ **React Performance**: [react-performance.md](./testing-and-perf/react-performance.md)

---

## 🧭 1. React Architecture & Component Matrix

| Layer / Responsibility | Standard Pattern | Architectural Rule |
| :--- | :--- | :--- |
| **Component Architecture** | Pure Functional Components | Declare explicit prop interfaces (`FC<Props>`). Zero class components. |
| **Route Management** | React Router v8+ Data Routers | Define routes using `createBrowserRouter` with async route `loader` & `action` handlers. |
| **Form Management** | React Hook Form + Zod | Infer form schema types automatically via `z.infer<typeof schema>`. |
| **Global Client State** | Context API / Zustand | Keep state local whenever possible; lift to Zustand/Context for global tokens/themes. |
| **Async Data Fetching** | Custom Hooks + Axios | Isolate side-effects and API calls inside reusable custom hooks (`useOrders`). |
| **Automated Testing** | Vitest + Testing Library | Write user-centric unit/integration tests matching accessible roles (`getByRole`). |

---

## 🛠️ 2. Production Code Standard Pattern

```tsx
import React, { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createOrderSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

interface OrderFormProps {
  onSubmit: (data: CreateOrderInput) => Promise<void>;
}

export const OrderForm: FC<OrderFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">Item ID</label>
        <input {...register('itemId')} className="border rounded p-2 w-full" />
        {errors.itemId && <p className="text-red-500 text-sm mt-1">{errors.itemId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          className="border rounded p-2 w-full"
        />
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Submit Order'}
      </button>
    </form>
  );
};
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Legacy Class Components**: Writing `class Component extends React.Component` instead of functional components.
- ❌ **Implicit `any` Types**: Omitting TypeScript type definitions or suppressing lints with `// @ts-ignore`.
- ❌ **Inline CSS Styles**: Using `style={{ color: 'red' }}` instead of utility-first Tailwind classes.
- ❌ **Prop Drilling Beyond 3 Levels**: Passing state through multi-level component trees without Context or Zustand.

---

## 🔍 Verification & Quality Assurance

- **Type Check Assertion**: `npx tsc --noEmit` asserting zero compilation errors.
- **Unit Test Execution**: `npx vitest run` validating component rendering and form validation behavior.
