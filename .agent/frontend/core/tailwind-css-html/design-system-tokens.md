# Skill: .agent/frontend/core/tailwind-css-html/design-system-tokens.md

## 📌 Core Philosophy & Constraints
- **CSS-First Design System**: Reuse existing CSS design system components (`client/src/css/app.css`) instead of creating new styles or rebuilding components with Tailwind.
- **Tailwind CSS v4 & Semantic Tokens**: Exclusively use semantic theme tokens (`bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-accent`, `bg-neutral`, `bg-success`, `bg-warning`, `bg-danger`, `text-black`, `text-white`, `border-border`) over standard color palettes (`bg-gray-*`, `bg-slate-*`, `bg-zinc-*`) or hardcoded hex values.
- **UI Generation Order**:
  1. Use an existing semantic component (`.button`, `.card`, `.badge`, `.form-*`, `.table-*`, `.breadcrumb-*`).
  2. Extend with Tailwind utilities strictly for layout (`flex`, `grid`, `gap-*`), positioning (`relative`, `absolute`, `z-*`), spacing (`p-*`, `m-*`), sizing (`w-*`, `h-*`, `max-w-*`), display & responsive (`hidden`, `md:block`), overflow, or small interaction utilities (`transition`, `cursor-pointer`, `truncate`).
  3. Apply semantic Tailwind theme tokens for any additional styling.
  4. Write new CSS in `client/src/css/app.css` only if no existing component satisfies requirements.
- **Design System Overrides**: Use the `!` modifier (or `important:`) when Tailwind utilities must override strict design system classes.
- **App Shell Structure**: Application pages must follow the existing shell structure: `.app-shell`, `.app-shell-sidebar`, `.app-shell-main`, `.navbar`, `.app-shell-content`.
- **Dark Mode**: Root `.dark` class controls theme states. Always prefer semantic tokens over explicit light/dark color combinations.

## ⚡ Production Boilerplate / Standard Pattern

```html
<!-- Main Application Page using App Shell & Design System Components -->
<div class="app-shell min-h-screen bg-background text-foreground">
  <!-- Sidebar Navigation -->
  <aside class="app-shell-sidebar border-r border-border p-4">
    <nav class="breadcrumb flex flex-col gap-2">
      <a href="#" class="breadcrumb-item font-medium">Home</a>
      <span class="breadcrumb-separator">/</span>
      <a href="#" class="breadcrumb-item font-medium text-primary">Dashboard</a>
    </nav>
  </aside>

  <!-- Main Section -->
  <main class="app-shell-main flex-1">
    <header class="navbar border-b border-border p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">Dashboard</h1>
      <span class="badge badge-success">Active</span>
    </header>

    <div class="app-shell-content p-6 space-y-6">
      <!-- Semantic Card Component Extended with Tailwind Layout -->
      <div class="card p-6 border border-border bg-card rounded-lg shadow-sm">
        <div class="card-header pb-4 border-b border-border flex items-center justify-between">
          <h2 class="card-title text-lg font-semibold text-foreground">Account Overview</h2>
          <span class="badge badge-warning">Pending Review</span>
        </div>
        <div class="card-content py-4 space-y-4">
          <p class="card-description text-sm text-neutral-foreground">Update your preferences and manage notification settings.</p>
          
          <form class="form-group space-y-4">
            <div class="space-y-1">
              <label for="username" class="form-label text-sm font-medium">Username</label>
              <input id="username" type="text" class="form-input w-full bg-background border-border text-foreground" placeholder="johndoe" />
              <span class="form-helper text-xs text-neutral-foreground">Must be unique across the platform.</span>
            </div>
            
            <div class="flex gap-3 pt-2">
              <button type="submit" class="button button-primary button-md">Save Changes</button>
              <button type="button" class="button button-outline button-md">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Data Table Component -->
      <div class="table-container border border-border rounded-lg overflow-hidden">
        <table class="table table-hover table-striped w-full text-left text-sm">
          <thead class="bg-neutral text-neutral-foreground border-b border-border">
            <tr>
              <th class="p-3">User</th>
              <th class="p-3">Role</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border">
              <td class="p-3 font-medium">Jane Doe</td>
              <td class="p-3">Admin</td>
              <td class="p-3"><span class="badge badge-success">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Recreating Existing Components**: Rebuilding buttons, cards, or badges with Tailwind utility soup instead of using `.button`, `.card`, `.badge`, etc.
- ❌ **Color Palette Utilities**: Using `bg-gray-*`, `bg-slate-*`, `bg-zinc-*`, or hardcoded hex values (`#ffffff`) instead of semantic tokens (`bg-background`, `bg-card`, `text-foreground`).
- ❌ **Ignoring App Shell**: Bypassing `.app-shell`, `.app-shell-sidebar`, `.app-shell-main`, `.navbar`, and `.app-shell-content` when creating page layouts.
- ❌ **Inline CSS & Ad-hoc Rules**: Adding inline `style="..."` or creating custom CSS before checking `client/src/css/app.css`.

## 🔍 Verification & Testing
- **Component Reuse Verification**: Confirm `.button`, `.card`, `.badge`, `.form-*`, `.table-*`, and `.breadcrumb-*` are used for standard UI elements.
- **Theme Token Audit**: Ensure zero hardcoded hex values or standard Tailwind color palettes (`bg-gray-*`, `bg-slate-*`) exist in markup.
- **Layout Compliance**: Verify application pages inherit `.app-shell` family layout hierarchy.
- **Dark Mode Verification**: Ensure dark mode toggles via the root `.dark` class smoothly across semantic tokens.
