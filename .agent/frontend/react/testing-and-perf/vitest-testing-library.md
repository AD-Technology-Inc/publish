# Skill: .agent/frontend/react/testing-and-perf/vitest-testing-library.md

## 📌 Core Philosophy & Constraints
- **React Testing Library (RTL)**: Test components from the user's perspective (`screen.getByRole`).
- **User-Event Library**: Simulate user interactions using `@testing-library/user-event` instead of `fireEvent`.
- **MSW API Mocks**: Intercept network requests using Mock Service Worker (`msw`) instead of mocking Axios/fetch manually.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
// tests/components/LoginForm.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm.tsx', () => {
  it('renders inputs and handles submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /submit/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(submitBtn);

    expect(emailInput).toHaveValue('user@example.com');
  });
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Querying Container Classnames**: Using `container.querySelector('.submit-btn-class')` instead of semantic roles/labels.
- ❌ **Using `fireEvent` Over `userEvent`**: Using `fireEvent.change()` which skips browser event bubbling sequence.
- ❌ **Testing Internal Component State**: Asserting internal `useState` values instead of visible DOM changes.

## 🔍 Verification & Testing
- **Vitest RTL Command**: `npx vitest run --environment jsdom` asserting all DOM expectations pass.
