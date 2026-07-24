# Skill: .agent/frontend/core/tailwind-css-html/layout-and-responsiveness.md

## 📌 Core Philosophy & Constraints
- **App Shell Structure**: Application pages must follow the design system shell structure (`.app-shell`, `.app-shell-sidebar`, `.app-shell-main`, `.navbar`, `.app-shell-content`).
- **Mobile-First Responsive Design**: Write base styles for mobile viewports (`320px+`), then apply responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`).
- **CSS Grid & Flexbox**: Use Flexbox for 1D navigation/alignments and CSS Grid for 2D content layouts.
- **Mobile Navigation**: Use Tailwind layout utilities (`hidden md:block`, `flex-col md:flex-row`) while preserving existing theme classes.
- **Fluid Layouts**: Prefer percentage, `fr` units, and container queries over static pixel constraints.

## ⚡ Production Boilerplate / Standard Pattern

```html
<!-- App Shell Dashboard Layout (Mobile-First) -->
<div class="app-shell min-h-screen bg-background flex flex-col md:flex-row">
  <!-- Mobile Header Navbar -->
  <header class="navbar md:hidden border-b border-border p-4 flex items-center justify-between">
    <span class="font-bold text-foreground">App Name</span>
    <button class="button button-outline button-sm">Menu</button>
  </header>

  <!-- App Shell Sidebar -->
  <aside class="app-shell-sidebar w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 bg-card">
    <nav class="breadcrumb flex flex-row md:flex-col gap-2">
      <a href="#" class="breadcrumb-item px-3 py-2 rounded-md bg-accent text-accent-foreground font-medium text-sm">Dashboard</a>
      <a href="#" class="breadcrumb-item px-3 py-2 rounded-md hover:bg-neutral text-neutral-foreground text-sm">Settings</a>
    </nav>
  </aside>

  <!-- App Shell Main Section -->
  <main class="app-shell-main flex-1 flex flex-col">
    <!-- Desktop Top Navbar -->
    <header class="navbar hidden md:flex border-b border-border p-4 items-center justify-between bg-card">
      <h1 class="text-xl font-bold text-foreground">Dashboard</h1>
      <span class="badge badge-success">System Operational</span>
    </header>

    <!-- Main Content Grid -->
    <div class="app-shell-content flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card border border-border rounded-lg p-4 bg-card shadow-sm">
        <h3 class="card-title text-sm font-medium text-neutral-foreground">Metric A</h3>
        <p class="text-2xl font-bold mt-2">1,248</p>
      </div>
      <div class="card border border-border rounded-lg p-4 bg-card shadow-sm">
        <h3 class="card-title text-sm font-medium text-neutral-foreground">Metric B</h3>
        <p class="text-2xl font-bold mt-2">99.9%</p>
      </div>
      <div class="card border border-border rounded-lg p-4 bg-card shadow-sm sm:col-span-2 lg:col-span-1">
        <h3 class="card-title text-sm font-medium text-neutral-foreground">Metric C</h3>
        <p class="text-2xl font-bold mt-2">42ms</p>
      </div>
    </div>
  </main>
</div>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Desktop-First Media Queries**: Writing max-width overrides (`max-md:`) instead of mobile-first modifiers.
- ❌ **Bypassing App Shell**: Using ad-hoc layout wrappers instead of `.app-shell`, `.app-shell-sidebar`, `.app-shell-main`, `.navbar`, and `.app-shell-content`.
- ❌ **Fixed Container Heights**: Hardcoding `h-[800px]` causing text overflow on scaled viewports.
- ❌ **Horizontal Scroll Spill**: Missing `overflow-x-hidden` or failing to handle wide table columns.

## 🔍 Verification & Testing
- **App Shell Alignment**: Verify layout elements use standard shell class names.
- **Viewport Testing**: Verify layout scaling across 375px (Mobile), 768px (Tablet), 1280px (Desktop) in Playwright.
