# Skill: .agent/frontend/react/testing-and-perf/playwright.md

## 📌 Core Philosophy & Constraints
- **Playwright E2E Cross-Browser**: Test critical user flows in Chromium, Firefox, and WebKit.
- **Fixtures & Page Objects**: Encapsulate setup steps inside Playwright custom fixtures and Page Objects.
- **Cross-Browser Visual Regression**: Validate responsive layouts using `expect(page).toHaveScreenshot()`.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// tests/e2e/react-app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('React Application E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can fill out form and see dashboard redirection', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('responsive mobile navigation drawer opens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[aria-label="Open Navigation Menu"]');

    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
  });
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Hardcoded `waitForTimeout` Sleeps**: Using fixed delay sleeps instead of web-first locators (`toBeVisible()`).
- ❌ **CSS Class Dependency**: Relying on generated CSS modules classes (e.g. `.Button_btn__x891`).
- ❌ **Ignoring Mobile Viewports**: Running E2E tests exclusively on desktop screen sizes.

## 🔍 Verification & Testing
- **Execution Command**: `npx playwright test` asserting cross-browser test matrix clean pass.
