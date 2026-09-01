---
name: matt-pocock-typescript-patterns
description: Total TypeScript architectural patterns by Matt Pocock (Discriminated Unions, Branded Types, Generic Type Narrowing, Zod Schema Validation, and Template Literal Types).
---

# Matt Pocock Total TypeScript Architectural Patterns

This skill documents production-grade TypeScript patterns for building scalable, type-safe full-stack systems.

---

## 1. Core Patterns

### Pattern 1: Discriminated Unions for State Machines
```typescript
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### Pattern 2: Branded / Nominal Types
```typescript
export type UserId = string & { readonly __brand: unique symbol };
export type OrderId = string & { readonly __brand: unique symbol };
```

### Pattern 3: Zod Schema Inferred Typing
```typescript
import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  completed: z.boolean().default(false)
});
export type Task = z.infer<typeof TaskSchema>;
```
