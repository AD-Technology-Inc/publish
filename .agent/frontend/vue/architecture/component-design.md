# Skill: .agent/frontend/vue/architecture/component-design.md

## 📌 Core Philosophy & Constraints
- **Two-Way Binding (`v-model`)**: Standardize two-way state using `defineModel()`.
- **Slot Composition**: Use named and scoped slots (`<slot :item="item">`) for flexible component layouts.
- **Strict Injection**: Use InjectionKeys for `provide`/`inject` with fallback handling.

## ⚡ Production Boilerplate / Standard Pattern

```vue
<script setup lang="ts" generic="T extends { id: string | number }">
import { type InjectionKey, inject } from 'vue';

// Define Two-Way Model
const modelValue = defineModel<string>({ required: true });

// Component Props & Generic Slot Binding
defineProps<{
  items: T[];
  title?: string;
}>();

// Strongly-Typed Inject
export const ThemeKey: InjectionKey<string> = Symbol('ThemeKey');
const activeTheme = inject(ThemeKey, 'light');
</script>

<template>
  <div class="custom-card border p-4 rounded-lg" :class="activeTheme">
    <h3 v-if="title" class="font-bold text-lg mb-2">{{ title }}</h3>

    <input
      v-model="modelValue"
      type="text"
      class="border px-3 py-1 rounded w-full mb-4"
    />

    <ul class="space-y-2">
      <li v-for="item in items" :key="item.id">
        <slot name="item" :item="item">
          <!-- Fallback slot content -->
          <span class="text-sm">{{ item.id }}</span>
        </slot>
      </li>
    </ul>
  </div>
</template>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Legacy `v-model` Event Handling**: Manually creating `:modelValue` and `@update:modelValue` instead of `defineModel()`.
- ❌ **Untyped Provide/Inject**: Using string keys (`provide('theme', 'dark')`) causing injection type loss.
- ❌ **Overusing `provide`/`inject`**: Using injection for local parent-child communication instead of props/emits.

## 🔍 Verification & Testing
- **Vue Test Utils**: Test model updates asserting `wrapper.setValue()` triggers model binding change.
