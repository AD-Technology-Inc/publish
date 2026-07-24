# Skill: .agent/frontend/react/architecture/functional-components.md

## 📌 Core Philosophy & Constraints
- **React 19 Functional Components**: Use `FC<Props>` or typed props explicitly. Class components are forbidden.
- **Compound Components Pattern**: Structure complex UI components (e.g. Card, Select, Modal) using parent-child compound relationships.
- **Strict Immutability**: Component render logic MUST be pure functions without side effects during render execution.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
import React, { type FC, type ReactNode, createContext, useContext } from 'react';

// 1. Compound Component Context
interface CardContextType {
  variant: 'default' | 'outline';
}
const CardContext = createContext<CardContextType | undefined>(undefined);

// 2. Main Component Props
export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

export const Card: FC<CardProps> & {
  Header: FC<{ children: ReactNode }>;
  Content: FC<{ children: ReactNode }>;
} = ({ children, variant = 'default', className = '' }) => {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`rounded-lg border p-4 ${variant === 'outline' ? 'border-2' : 'border'} ${className}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

// 3. Child Components
Card.Header = ({ children }) => {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('Card.Header must be used within <Card>');
  return <div className="border-b pb-2 font-bold">{children}</div>;
};

Card.Content = ({ children }) => {
  return <div className="pt-2">{children}</div>;
};
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Legacy Class Components**: Using `class Component extends React.Component`.
- ❌ **Untyped Props / `any`**: Writing `const Card = (props: any) => ...`.
- ❌ **Direct DOM Mutation in Render**: Mutating refs or external state during render without `useEffect`.

## 🔍 Verification & Testing
- **TypeScript Check**: `tsc --noEmit` asserting compound sub-components require correct context provider wrapping.
