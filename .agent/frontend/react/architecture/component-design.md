# Skill: .agent/frontend/react/architecture/component-design.md

## 📌 Core Philosophy & Constraints
- **Children & Slots Composition**: Pass UI sections via `children` or named prop slots (`headerSlot`, `footerSlot`).
- **Portal Rendering**: Render modals, tooltips, and floating menus via `createPortal()` to avoid z-index stacking issues.
- **Render Props**: Use render prop functions when consumers need control over child rendering logic.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
import React, { type FC, type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-lg rounded-lg bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Modals Without Portals**: Rendering modal overlays directly inside deeply nested overflow hidden containers.
- ❌ **Prop Drilling Beyond 3 Levels**: Passing callbacks down multiple layers instead of React Context or Zustand.
- ❌ **Hardcoded Structural Nodes**: Hardcoding layout sections inside child components instead of delegating via `children`.

## 🔍 Verification & Testing
- **RTL Portal Test**: Test modal portal rendering asserting modal container is appended directly to `document.body`.
