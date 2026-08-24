---
name: frontend-core
description: "Strict TypeScript/JavaScript declarations, ESNext async concurrency, Tailwind CSS tokens, and HTML5 Accessibility guidelines."
---

# Frontend Core Engineering & Accessibility Skill Registry

This document serves as the master decision matrix and standards specification reference for AI agents writing production frontend TypeScript code, responsive Tailwind layouts, and accessible HTML5 interfaces.

---

## 🛠️ Tech Stack & Standards Manifest

- **Language & Compiler**: TypeScript 5.x (Strict Null Checks, Zero `any`, `noImplicitAny: true`)
- **JavaScript Specification**: ESNext (ES2024+ Async Concurrency, `Promise.allSettled`, Structured Clone)
- **Styling Framework**: Tailwind CSS 3.4 / 4.0 (Semantic Design Tokens, Flex/Grid Layouts)
- **Accessibility Specification**: WAI-ARIA 1.2 / WCAG 2.1 AA Compliance (Semantic HTML5, ARIA Attributes)
- **Code Quality**: ESLint Strict Mode + Prettier

---

## 🔗 Sub-Skill Deep Dive References

- 📘 **Strict Type Declarations**: [strict-type-declarations.md](./references/strict-type-declarations.md)
- ⚡ **Async Concurrency**: [async-concurrency.md](./references/async-concurrency.md)
- 🚀 **ESNext Patterns**: [esnext-patterns.md](./references/esnext-patterns.md)
- 🎨 **Design System Tokens**: [design-system-tokens.md](./references/design-system-tokens.md)
- 📐 **Layout & Responsiveness**: [layout-and-responsiveness.md](./references/layout-and-responsiveness.md)
- ♿ **Semantic HTML & A11y**: [semantic-html-a11y.md](./references/semantic-html-a11y.md)

---

## 🧭 1. Frontend Core Decision Matrix

| Domain / Responsibility | Standard Pattern | Architectural Rule |
| :--- | :--- | :--- |
| **Type Definitions** | Explicit Interfaces & Types | Avoid `any` or `unknown` casts. Define strict prop, state, and API payload contracts. |
| **Async Operations** | `async/await` + `try/catch` | Handle loading, error, and success states explicitly. Never leave floating promises. |
| **Design Tokens** | HSL CSS Variables + Tailwind | Use semantic token classes (`bg-background`, `text-foreground`, `border-border`). |
| **Responsive Design** | Mobile-First Breakpoints | Mobile layouts by default, scale up using `sm:`, `md:`, `lg:`, `xl:` utilities. |
| **Accessibility (A11y)** | Semantic HTML5 & ARIA | Use native `<button>`, `<nav>`, `<header>`, `<main>`; add `aria-label` & keyboard handlers. |

---

## 🛠️ 2. Production Code Standard Pattern

```typescript
import { type FC, type MouseEvent } from 'react';

export interface ActionButtonProps {
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
}

const variantStyles: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
};

export const ActionButton: FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || label}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
        transition-colors duration-150 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${variantStyles[variant]}
      `.stripWhitespace()}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
};
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Use of `any` Types**: Declaring `data: any` or using `@ts-ignore` to suppress type safety compilation errors.
- ❌ **Floating Unhandled Promises**: Invoking async functions without `await` or `.catch()` error handling.
- ❌ **Non-Semantic Div Buttons**: Creating clickable elements with `<div onClick={...}>` without `role="button"`, `tabIndex`, or keyboard event listeners.
- ❌ **Arbitrary Pixel Utilities**: Using static pixel classes (e.g. `h-[317px]`, `w-[542px]`) instead of design token spacing scale.
- ❌ **Missing Color Contrast / Focus Rings**: Omitting `focus-visible:ring-2` styles making interfaces inaccessible to keyboard navigation.

---

## 🔍 Verification & Quality Assurance

- **Type Check Assertion**: `npx tsc --noEmit` asserting 0 compilation errors across strict type declarations.
- **Accessibility Verification**: Test components with `axe-core` / `@axe-core/react` ensuring 0 WCAG 2.1 AA violations.