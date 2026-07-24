# Skill: .agent/frontend/ui-design/tailwind-css-html/design-system-tokens.md

## 📌 Core Philosophy & Constraints
- **Semantic CSS Variables**: Map color schemes, dark mode tokens, and spacing to CSS variables in `:root` / `.dark`.
- **Consistent Scale**: Use Tailwind CSS design tokens (`bg-background`, `text-foreground`, `border-border`) exclusively.
- **Zero Arbitrary Values**: Avoid hardcoded pixel values like `w-[237px]` or `bg-[#1a202c]`.

## ⚡ Production Boilerplate / Standard Pattern

```css
/* index.css / design-tokens.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

```html
<!-- Component using semantic tokens -->
<div class="bg-background text-foreground border-border rounded-lg border p-6 shadow-sm">
  <h2 class="text-xl font-semibold tracking-tight">Design Token Card</h2>
  <button class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors">
    Action
  </button>
</div>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Hardcoded Hex Colors**: Writing `bg-[#ffffff]` or `text-[#000000]` instead of semantic Tailwind tokens.
- ❌ **Inline CSS Styles**: Using `style="color: red"` instead of utility classes.
- ❌ **Inconsistent Dark Mode**: Applying manual `dark:text-white` without dark mode semantic tokens.

## 🔍 Verification & Testing
- **Theme Audit**: Verify theme switching adds/removes `.dark` class on `<html>` root element seamlessly.
