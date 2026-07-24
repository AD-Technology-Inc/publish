# Skill: .agent/frontend/vue/forms-and-validation/vee-validate-zod.md

## 📌 Core Philosophy & Constraints
- **Zod Schema Validation**: Define form validation schemas using Zod schemas via `@vee-validate/zod`.
- **Form State Hook**: Manage form fields and error bindings using `useForm()` and `useField()`.
- **Type-Safe Submissions**: Infer form payload TypeScript interfaces directly from `z.infer<typeof schema>`.

## ⚡ Production Boilerplate / Standard Pattern

```vue
<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

// 1. Zod Schema Definition
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// 2. Setup Form with Typed Schema
const { handleSubmit, errors, isSubmitting } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(loginSchema),
});

// 3. Field Bindings
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

// 4. Form Submit Handler
const onSubmit = handleSubmit(async (values) => {
  console.log('Form Submitted:', values);
  // Perform async submit...
});
</script>

<template>
  <form class="space-y-4 max-w-sm" @submit.prevent="onSubmit">
    <div>
      <label class="block text-sm font-medium">Email</label>
      <input v-model="email" type="email" class="w-full border p-2 rounded" />
      <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</span>
    </div>

    <div>
      <label class="block text-sm font-medium">Password</label>
      <input v-model="password" type="password" class="w-full border p-2 rounded" />
      <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</span>
    </div>

    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full bg-primary text-white py-2 rounded"
    >
      {{ isSubmitting ? 'Logging in...' : 'Submit' }}
    </button>
  </form>
</template>
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Validation Regex**: Writing raw regex strings directly inside template input tags.
- ❌ **Untyped Form Values**: Manual typing of form submission payloads without Zod schema inference.
- ❌ **Disabling Native Form Prevention**: Omitting `.prevent` modifier on form `@submit` handlers.

## 🔍 Verification & Testing
- **Component Test**: Mount form, submit empty fields, assert error messages display correctly under input elements.
