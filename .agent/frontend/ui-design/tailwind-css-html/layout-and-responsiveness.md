# Skill: .agent/frontend/ui-design/tailwind-css-html/layout-and-responsiveness.md

## 📌 Core Philosophy & Constraints
- **Mobile-First Responsive Design**: Write base styles for mobile viewports (`320px+`), then add `sm:`, `md:`, `lg:`, `xl:`.
- **CSS Grid & Flexbox**: Use Flexbox for 1D alignments and CSS Grid for 2D multi-column layouts.
- **Fluid Layouts**: Prefer percentage, `fr` units, and container queries over static pixel constraints.

## ⚡ Production Boilerplate / Standard Pattern

```html
<!-- Responsive Dashboard Layout (Mobile-First) -->
<div class="min-h-screen bg-background flex flex-col md:flex-row">
  <!-- Sidebar -->
  <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4">
    <nav class="flex flex-row md:flex-col gap-2">
      <a href="#" class="px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm">Dashboard</a>
      <a href="#" class="px-3 py-2 rounded-md hover:bg-muted text-muted-foreground text-sm">Settings</a>
    </nav>
  </aside>

  <!-- Main Content Grid -->
  <main class="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="border border-border rounded-lg p-4 bg-card shadow-sm">Metric A</div>
    <div class="border border-border rounded-lg p-4 bg-card shadow-sm">Metric B</div>
    <div class="border border-border rounded-lg p-4 bg-card shadow-sm sm:col-span-2 lg:col-span-1">Metric C</div>
  </main>
</div>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Desktop-First Media Queries**: Writing max-width overrides (`max-md:`) instead of mobile-first modifiers.
- ❌ **Fixed Container Heights**: Hardcoding `h-[800px]` causing text overflow on scaled viewports.
- ❌ **Horizontal Scroll Spill**: Missing `overflow-x-hidden` or failing to handle wide table columns.

## 🔍 Verification & Testing
- **Viewport Testing**: Verify layout scaling across 375px (Mobile), 768px (Tablet), 1280px (Desktop) in Playwright.
