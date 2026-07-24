# Skill: .agent/frontend/vue/testing-and-perf/vue-performance.md

## 📌 Core Philosophy & Constraints
- **Async Component Splitting**: Wrap heavy components in `defineAsyncComponent()` with fallback skeleton loaders.
- **State Optimization**: Use `shallowRef()` / `markRaw()` for large read-only datasets or third-party chart libraries.
- **KeepAlive Caching**: Wrap dynamic tab views in `<KeepAlive :max="10">` to preserve DOM state across tab switches.

## ⚡ Production Boilerplate / Standard Pattern

```vue
<script setup lang="ts">
import { defineAsyncComponent, shallowRef, markRaw, onMounted } from 'vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';

// 1. Lazy Async Heavy Component
const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/HeavyChart.vue'),
  loadingComponent: LoadingSkeleton,
  delay: 200,
});

// 2. Non-Reactive Raw Data Reference
const rawChartData = shallowRef<Array<{ x: number; y: number }>>([]);

onMounted(() => {
  // Prevent deep reactive proxying on 10,000 read-only items
  const data = Array.from({ length: 10000 }, (_, i) => ({ x: i, y: i * 2 }));
  rawChartData.value = markRaw(data);
});
</script>

<template>
  <div class="dashboard-performance-wrapper">
    <!-- 3. KeepAlive Dynamic Component Caching -->
    <router-view v-slot="{ Component }">
      <keep-alive :max="5">
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <HeavyChart :data="rawChartData" />
  </div>
</template>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Deep Reactive Proxies on Huge Lists**: Wrapping 50,000 row API data arrays in `ref()` or `reactive()`.
- ❌ **Unbounded KeepAlive Cache**: Using `<KeepAlive>` without a `:max` threshold causing client memory exhaustion.
- ❌ **Eager Heavy Library Loading**: Importing 500KB chart/editor libraries at top-level of main SFC files.

## 🔍 Verification & Testing
- **Vite Bundle Analyzer**: Run `npx vite-bundle-visualizer` asserting zero monolithic vendor chunk files > 300KB.
