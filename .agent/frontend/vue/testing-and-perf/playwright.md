# Skill: .agent/frontend/vue/testing-and-perf/playwright.md

## 📌 Core Philosophy & Constraints
- **Playwright E2E for Vue**: Test end-to-end user flows against live Vue 3 dev/preview servers.
- **Storage State Authentication**: Reuse authenticated browser context (`storageState.json`) to skip repetitive login UI steps.
- **Visual Regression Testing**: Use `expect(page).toHaveScreenshot()` for component visual regression assertions.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// tests/e2e/vue-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Vue 3 Dashboard E2E Workflow', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('loads dynamic dashboard stats card', async ({ page }) => {
    const statsCard = page.locator('[data-testid="stats-card"]');
    await expect(statsCard).toBeVisible();
    await expect(statsCard).toContainText('Active Users');
  });

  test('navigates to user profile via dropdown menu', async ({ page }) => {
    await page.click('[data-testid="user-avatar-btn"]');
    await page.click('text=Profile Settings');

    await expect(page).toHaveURL('/settings/profile');
    await expect(page.locator('h1')).toHaveText('Profile Settings');
  });
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Hardcoded UI Sleep Delays**: Using `page.waitForTimeout()` instead of Playwright web-first locators (`toBeVisible()`).
- ❌ **Brittle Dynamic Selectors**: Locating element nodes using unstable auto-generated Vue classes.
- ❌ **Logging In Before Every Test**: Re-executing full login form submit steps in every individual test spec.

## 🔍 Verification & Testing
- **Execution Command**: `npx playwright test --project=chromium` asserting visual and functional passes.
