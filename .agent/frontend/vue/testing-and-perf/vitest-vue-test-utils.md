# Skill: .agent/frontend/vue/testing-and-perf/vitest-vue-test-utils.md

## 📌 Core Philosophy & Constraints
- **Vue Test Utils 2.x**: Use `@vue/test-utils` for component mounting and wrapper assertions.
- **Component Isolation**: Mock Pinia stores, Vue Router, and external API requests per test case.
- **User-Centric Interactions**: Test component outputs via user events (`wrapper.find().trigger()`) rather than invoking internal SFC methods.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// tests/unit/components/Counter.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import CounterComponent from '@/components/CounterComponent.vue';

describe('CounterComponent.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(CounterComponent, {
      props: {
        initialCount: 5,
        maxLimit: 10,
      },
    });
  });

  it('renders initial prop count correctly', () => {
    expect(wrapper.text()).toContain('Count: 5');
  });

  it('increments count on button click and emits update event', async () => {
    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.text()).toContain('Count: 6');
    expect(wrapper.emitted('update:count')).toBeTruthy();
    expect(wrapper.emitted('update:count')![0]).toEqual([6]);
  });

  it('disables button when max limit is reached', async () => {
    await wrapper.setProps({ initialCount: 10 });
    const button = wrapper.find('button');

    expect(button.attributes('disabled')).toBeDefined();
  });
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct Method Calls**: Calling `wrapper.vm.increment()` directly instead of simulating trigger events.
- ❌ **Global Test State Leak**: Reusing a single `mount()` wrapper instance across multiple tests without re-creating.
- ❌ **Testing Implementation Details**: Asserting internal private ref variables instead of rendered template text/DOM state.

## 🔍 Verification & Testing
- **Vitest Command**: `npx vitest run --environment jsdom` asserting clean passes.
