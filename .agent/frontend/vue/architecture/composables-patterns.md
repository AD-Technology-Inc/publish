# Skill: .agent/frontend/vue/architecture/composables-patterns.md

## 📌 Core Philosophy & Constraints
- **Naming & Scope**: Custom composables MUST be named `useXxx()` and reside in `src/composables/`.
- **Flexible Arguments**: Accept refs/getters as inputs using `toValue()` / `unref()`.
- **Automatic Cleanup**: Clean up event listeners, timers, or abort controllers in `onUnmounted()`.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/composables/useFetch.ts
import { ref, watchEffect, toValue, onUnmounted, type MaybeRefOrGetter } from 'vue';

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const isLoading = ref<boolean>(false);

  let controller: AbortController | null = null;

  watchEffect(async () => {
    // Cancel previous in-flight request
    if (controller) controller.abort();
    controller = new AbortController();

    const targetUrl = toValue(url);
    if (!targetUrl) return;

    isLoading.value = true;
    error.value = null;

    try {
      const res = await fetch(targetUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      data.value = (await res.json()) as T;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  });

  onUnmounted(() => {
    if (controller) controller.abort();
  });

  return { data, error, isLoading };
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Global State Leak**: Declaring top-level `const state = ref()` outside the composables function unless explicit global singleton behavior is intended.
- ❌ **Ignoring `toValue()`**: Accessing `url.value` directly without wrapping inputs in `toValue()`.
- ❌ **Dangling Event Listeners**: Adding `window.addEventListener` without removing it in `onUnmounted()`.

## 🔍 Verification & Testing
- **Vitest Unit Test**: Mount composable via `withSetup()` helper asserting reactive state updates and unmount cleanup.
