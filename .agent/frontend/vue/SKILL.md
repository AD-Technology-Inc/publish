# Skill: .agent/frontend/vue/SKILL.md

# Vue 3 Composition API & Pinia Architecture Skill Registry

This document serves as the decision matrix and component pattern reference for AI agents building enterprise Vue 3 applications using script setup, Pinia, and Vue Router 4+.

---

## 🛠️ Tech Stack & Version Manifest

- **Core Framework**: Vue 3.x (Composition API, `<script setup lang="ts">`)
- **Routing Engine**: Vue Router 4.x (History Mode, Navigation Guards)
- **State Management**: Pinia 3.x (Option/Setup Stores, Local Storage Persistence)
- **Forms & Validation**: VeeValidate 4.x + Zod 3.x (`@vee-validate/zod`)
- **UI Components & Styling**: Shadcn Vue + Radix Vue + Tailwind CSS 3.x / 4.x
- **HTTP Client**: Axios 1.x (Interceptors, Typed Responses)
- **Testing Tools**: Vitest 3.x + `@vue/test-utils` 2.x + Playwright 1.x

---

## 🔗 Sub-Skill Deep Dive References

- 💚 **Composition API**: [composition-api.md](./architecture/composition-api.md)
- 🔌 **Composables Patterns**: [composables-patterns.md](./architecture/composables-patterns.md)
- 🧩 **Component Design**: [component-design.md](./architecture/component-design.md)
- 🍍 **Pinia State Management**: [pinia-state-management.md](./state-and-data/pinia-state-management.md)
- 🌐 **Axios API Client**: [axios-api-client.md](./state-and-data/axios-api-client.md)
- 🗺️ **Route Definitions**: [route-definitions.md](./router-development/route-definitions.md)
- 🛡️ **Navigation Guards**: [navigation-guards.md](./router-development/navigation-guards.md)
- 📝 **VeeValidate & Zod**: [vee-validate-zod.md](./forms-and-validation/vee-validate-zod.md)
- 🎨 **Shadcn Vue**: [shadcn-vue.md](./UI-and-styling/shadcn-vue.md)
- 🧪 **Vitest Vue Test Utils**: [vitest-vue-test-utils.md](./testing-and-perf/vitest-vue-test-utils.md)
- 🎭 **Playwright E2E**: [playwright.md](./testing-and-perf/playwright.md)
- ⚡ **Vue Performance**: [vue-performance.md](./testing-and-perf/vue-performance.md)

---

## 🧭 1. Vue 3 Architecture & Component Matrix

| Layer / Responsibility | Standard Pattern | Architectural Rule |
| :--- | :--- | :--- |
| **Component Architecture** | Single File Components (`.vue`) | Use `<script setup lang="ts">` exclusively. Declare typed props (`defineProps<Props>()`). |
| **Reusable Logic** | Composables (`useFeature`) | Extract reactive logic into composable functions returning `ref` and `computed` state. |
| **Global Client State** | Pinia Setup Stores | Use `defineStore('id', () => { ... })` for global user sessions and shopping carts. |
| **Form Management** | VeeValidate + Zod | Bind form fields with `useForm({ validationSchema: toTypedSchema(schema) })`. |
| **Automated Testing** | Vitest + Vue Test Utils | Mount components using `mount()` asserting DOM output and emitted events (`emitted()`). |

---

## 🛠️ 2. Production Code Standard Pattern

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

interface Props {
  title: string;
  initialCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
});

const emit = defineEmits<{
  (e: 'update:count', value: number): void;
}>();

const authStore = useAuthStore();
const count = ref(props.initialCount);

const doubleCount = computed(() => count.value * 2);

function increment(): void {
  count.value++;
  emit('update:count', count.value);
}
</script>

<template>
  <div className="p-4 border rounded shadow-sm max-w-sm">
    <h3 className="text-lg font-bold">{{ title }}</h3>
    <p className="text-gray-600 mt-1">User: {{ authStore.user?.name ?? 'Guest' }}</p>
    <div className="mt-4 flex items-center justify-between">
      <span>Count: {{ count }} (Double: {{ doubleCount }})</span>
      <button
        @click="increment"
        className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
      >
        +1
      </button>
    </div>
  </div>
</template>
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Legacy Options API**: Writing `export default { data(), methods: {} }` instead of Composition API.
- ❌ **Direct Prop Mutation**: Mutating a prop directly inside a child component instead of emitting events.
- ❌ **Untyped Reactive Refs**: Creating `const user = ref()` without generic type annotations (`ref<User | null>(null)`).

---

## 🔍 Verification & Quality Assurance

- **Type Check Assertion**: `npx vue-tsc --noEmit` asserting zero template type errors.
- **Unit Test Execution**: `npx vitest run` verifying component mounting and reactivity behavior.
