# Skill: .agent/engineering-standards/testing-strategy/e2e-testing.md

## 📌 Core Philosophy & Constraints
- **Critical Path Scenarios**: Limit E2E tests to core business workflows (e.g. signup, checkout, billing).
- **Page Object Model (POM)**: All DOM interactions MUST be encapsulated in Page Object classes.
- **Data Hygiene**: Tests MUST seed their own test data and clean up afterwards.
- **Zero Arbitrary Sleep**: Use explicit assertions (`expect(locator).toBeVisible()`) instead of fixed delays.

## ⚡ Production Boilerplate / Standard Pattern

### Playwright Page Object & E2E Test
```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}

// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can log in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');
  await loginPage.login('user@example.com', 'SecurePass123!');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Arbitrary Timeouts**: Using `page.waitForTimeout(3000)` instead of web-first assertions.
- ❌ **Brittle CSS Selectors**: Relying on positional or auto-generated class names (e.g. `div > div > span:nth-child(3)`).
- ❌ **Testing Minor Edge Cases**: Using slow E2E tests for form validation edge cases better tested in unit tests.

## 🔍 Verification & Testing
- **Execution Command**: `npx playwright test`
- **Report Check**: Assert HTML report generates with zero flaky retries in headless mode.
