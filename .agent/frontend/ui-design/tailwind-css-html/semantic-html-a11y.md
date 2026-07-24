# Skill: .agent/frontend/ui-design/tailwind-css-html/semantic-html-a11y.md

## 📌 Core Philosophy & Constraints
- **Semantic HTML5**: Use `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, and `<section>` instead of generic `<div>` nests.
- **WAI-ARIA & Focus Management**: Ensure interactive components have `aria-label`, visible focus rings (`focus-visible:outline-none focus-visible:ring-2`), and keyboard navigation.
- **Color Contrast**: Enforce WCAG AA contrast ratio (4.5:1 minimum for normal text).

## ⚡ Production Boilerplate / Standard Pattern

```html
<!-- Accessible Accessible Form Card -->
<section aria-labelledby="form-heading" class="max-w-md mx-auto p-6 bg-card border border-border rounded-lg shadow-sm">
  <h2 id="form-heading" class="text-xl font-bold text-foreground">Notification Preferences</h2>
  
  <form class="mt-4 space-y-4" aria-describedby="form-desc">
    <p id="form-desc" class="text-sm text-muted-foreground">Manage how updates are sent to your account.</p>

    <div>
      <label for="email-input" class="block text-sm font-medium text-foreground">Email Address</label>
      <input
        id="email-input"
        type="email"
        required
        aria-required="true"
        class="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      />
    </div>

    <button
      type="submit"
      class="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      Save Preferences
    </button>
  </form>
</section>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Clickable Divs**: Adding `@click` or `onClick` to `<div>` or `<span>` without `role="button"` and `tabindex="0"`.
- ❌ **Missing Form Labels**: Inputs without associated `<label for="...">` or `aria-label`.
- ❌ **Suppressing Focus Rings**: Removing focus styling with `outline-none` without providing alternative focus state.

## 🔍 Verification & Testing
- **Axe Accessibility Core**: Run `npx axe-core` or Playwright `@axe-core/playwright` assertions to verify zero A11y violations.
