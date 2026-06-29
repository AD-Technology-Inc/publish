---
name: design-system
description: "Use when building or modifying pages, components, templates, or UI styles in this repository. Prefer the existing CSS design system and Tailwind CSS v4 semantic tokens."
---

# Design System Guide

This project uses a **CSS-first design system** with Tailwind CSS v4. Reuse the existing design system whenever possible instead of creating new styles.

The project's design system is defined here:

- apps/client/src/css

If unavailable, locate the project's design system by inspecting existing CSS, components, and layouts.

## Workflow

Follow this order when generating UI:

1. Use an existing semantic component.
2. Extend it with Tailwind utilities only for layout or responsiveness.
3. Use semantic Tailwind theme tokens for any additional styling.
4. Create new CSS only if no existing component can satisfy the requirement.

Do not recreate existing components using Tailwind utilities.

## Existing Components

Prefer these classes whenever applicable.

### Buttons

- `.button`
- `.button-primary`
- `.button-secondary`
- `.button-outline`
- `.button-danger`
- `.button-link`
- `.button-sm`
- `.button-lg`

Example:

```html
<button class="button button-primary w-full">Save</button>
```

### Cards

- `.card`
- `.card-header`
- `.card-title`
- `.card-description`
- `.card-content`
- `.card-footer`

### Badges

- `.badge`
- `.badge-success`
- `.badge-warning`
- `.badge-danger`

### Forms

- `.form-group`
- `.form-label`
- `.form-input`
- `.form-select`
- `.form-checkbox`
- `.form-checkbox-wrapper`
- `.form-helper`

### Tables

- `.table-container`
- `.table`
- `.table-hover`
- `.table-striped`

### Navigation

- `.breadcrumb`
- `.breadcrumb-item`
- `.breadcrumb-separator`

## Tailwind Usage

Tailwind should primarily be used for:

- Layout (`flex`, `grid`, `gap-*`)
- Positioning (`relative`, `absolute`, `z-*`)
- Spacing (`p-*`, `m-*`)
- Sizing (`w-*`, `h-*`, `max-w-*`)
- Display & responsive utilities (`hidden`, `md:block`, etc.)
- Overflow and scrolling
- Small interaction utilities (`transition`, `cursor-pointer`, `truncate`)

Avoid using Tailwind to duplicate component styling.

## Theme Tokens

When styling is required, always use semantic theme utilities instead of Tailwind color palettes.

Prefer:

- `bg-background`
- `text-foreground`
- `bg-card`
- `bg-primary`
- `bg-secondary`
- `bg-muted`
- `text-muted-foreground`
- `border-border`
- `outline-ring`

Avoid:

- `bg-gray-*`
- `bg-slate-*`
- `bg-zinc-*`
- hardcoded hex colors
- arbitrary values unless explicitly requested

## Layout

Application pages should follow the existing shell structure:

- `.app-shell`
- `.app-shell-sidebar`
- `.app-shell-main`
- `.navbar`
- `.app-shell-content`

For mobile navigation, use Tailwind layout utilities while preserving the existing theme classes.

## Theme

Dark mode is controlled by the root `.dark` class.

Prefer semantic tokens (`bg-background`, `text-foreground`) instead of explicit light/dark color combinations whenever possible.

## Before Responding

Verify that:

- Existing components are reused.
- Components are not rebuilt with Tailwind.
- Semantic theme tokens are used.
- Layout follows the app shell.
- New CSS is introduced only when necessary.
