# Skill: .agent/frontend/react/forms-and-validation/react-hook-form-zod.md

## 📌 Core Philosophy & Constraints
- **Uncontrolled Inputs with RHF**: Use React Hook Form (`useForm`) for high-performance form state management.
- **Zod Schema Resolver**: Integrate schema validation strictly via `@hookform/resolvers/zod`.
- **Inferred Types**: Derive form values type using `z.infer<typeof schema>`.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
import React, { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    console.log('Form Submit Payload:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input {...register('email')} type="email" className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input {...register('password')} type="password" className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-2 rounded">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Controlled `useState` Form Lists**: Storing every keystroke in component state (`const [email, setEmail] = useState('')`).
- ❌ **Manual Field Validation Logic**: Writing custom `if (email.length < 5)` logic inside submit handlers.
- ❌ **Untyped `useForm`**: Calling `useForm()` without passing explicit generic type constraints.

## 🔍 Verification & Testing
- **React Testing Library Form Test**: Fill out form with RTL `userEvent.type()`, submit, and assert error message displays when fields are invalid.
