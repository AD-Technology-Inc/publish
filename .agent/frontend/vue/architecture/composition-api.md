# Skill: .agent/frontend/vue/architecture/composition-api.md

## 📌 Core Philosophy & Constraints
- **`<script setup>` Syntax**: Use SFC `<script setup lang="ts">` exclusively. Options API is strictly prohibited.
- **`ref` vs `reactive`**: Use `ref()` for primitive types and single entity replacements; use `shallowRef()` for large non-reactive objects.
- **Script Organization**: Order setup code: (1) Props/Emits, (2) State (`ref`), (3) Computed, (4) Methods, (5) Watchers/Lifecycle.

## ⚡ Production Boilerplate / Standard Pattern

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// 1. Props & Emits
interface Props {
  initialCount?: number;
  maxLimit?: number;
}
const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
  maxLimit: 100,
});

const emit = defineEmits<{
  (e: 'update:count', value: number): void;
}>();

// 2. Reactive State
const count = ref<number>(props.initialCount);

// 3. Computed Properties
const isMaxReached = computed<boolean>(() => count.value >= props.maxLimit);

// 4. Methods
function increment(): void {
  if (!isMaxReached.value) {
    count.value++;
    emit('update:count', count.value);
  }
}

// 5. Watchers & Lifecycle
watch(count, (newVal) => {
  console.log(`Count changed to: ${newVal}`);
});

onMounted(() => {
  console.log('Counter mounted successfully');
});
</script>

<template>
  <div class="counter-card p-4 border rounded-md">
    <p class="text-lg font-bold">Count: {{ count }}</p>
    <button
      :disabled="isMaxReached"
      class="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      @click="increment"
    >
      Increment
    </button>
  </div>
</template>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Options API Usage**: Defining components with `export default { data(), methods: {} }`.
- ❌ **Destructuring Props Directly**: `const { count } = defineProps()` breaks reactivity without `toRefs()`.
- ❌ **Mutating Props**: Assigning values directly to prop variables (`props.initialCount = 5`).

## 🔍 Verification & Testing
- **Vue-Tsc Check**: Execute `vue-tsc --noEmit` to verify type safety in SFC templates.
