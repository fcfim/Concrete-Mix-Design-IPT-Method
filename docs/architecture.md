# Architecture

This project follows **Clean Architecture** principles to ensure maintainability, testability, and separation of concerns.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                    (Next.js App Router)                      │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Playground    │  │   API Routes    │                   │
│  │   (page.tsx)    │  │ (/api/v1/...)   │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
├───────────┴────────────────────┴────────────────────────────┤
│                     Application Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CalculateDosageUseCase                   │   │
│  │  - Orchestrates domain services                       │   │
│  │  - Implements business logic flow                     │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                           │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │    Entities    │  │    Services    │                     │
│  │ - TraceResult  │  │ - AbramsLaw    │                     │
│  │ - DosageTarget │  │ - LyseLaw      │                     │
│  │ - Experimental │  │ - MolinariLaw  │                     │
│  └────────────────┘  └────────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  ┌───────────────────────┐  ┌───────────────────────┐       │
│  │    Math Services      │  │  Normative Services   │       │
│  │ - LinearRegression    │  │ - NBR6118Service      │       │
│  │ - AbramsLawService    │  │ - NBR12655Service     │       │
│  │ - LyseLawService      │  │                       │       │
│  │ - MolinariLawService  │  │                       │       │
│  └───────────────────────┘  └───────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router (Presentation)
│   ├── api/
│   │   └── v1/
│   │       └── dosage/
│   │           └── route.ts      # POST /api/v1/dosage endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Playground UI
│
├── core/                         # Domain & Application layers
│   ├── domain/
│   │   └── entities/             # Domain entities
│   │       ├── experimental-point.ts
│   │       ├── dosage-target.ts
│   │       └── trace-result.ts
│   │
│   ├── application/
│   │   └── use-cases/
│   │       └── calculate-dosage.use-case.ts
│   │
│   └── infrastructure/           # Implementation details
│       ├── math/
│       │   ├── linear-regression.service.ts
│       │   ├── abrams-law.service.ts
│       │   ├── lyse-law.service.ts
│       │   └── molinari-law.service.ts
│       │
│       └── normative/
│           ├── nbr-6118.service.ts
│           └── nbr-12655.service.ts
│
├── components/                   # UI Components
│   ├── ui/                       # shadcn/ui components
│   └── dosage-charts.tsx         # Recharts visualizations
│
└── shared/
    └── lib/
        └── schemas/
            └── dosage.schema.ts  # Zod validation schemas
```

---

## Layer Responsibilities

### 1. Presentation Layer (`src/app/`)

**Responsibility:** Handle HTTP requests, render UI, manage routing.

```typescript
// src/app/api/v1/dosage/route.ts
export async function POST(request: Request) {
  // 1. Parse and validate request
  const body = await request.json();
  const validated = dosageRequestSchema.safeParse(body);
  
  // 2. Call use case
  const result = CalculateDosageUseCase.execute(validated.data);
  
  // 3. Return response
  return Response.json({ success: true, data: result });
}
```

### 2. Application Layer (`src/core/application/`)

**Responsibility:** Orchestrate domain services, implement business workflows.

```typescript
// src/core/application/use-cases/calculate-dosage.use-case.ts
export class CalculateDosageUseCase {
  static execute(input: DosageInput): TraceResult {
    // 1. Calculate target strength (NBR 12655)
    const fcjTarget = NBR12655Service.calculateFcjTarget(
      input.target.fck,
      input.target.sd
    );
    
    // 2. Fit Abrams Law and find target a/c
    const abramsResult = AbramsLawService.fit(input.experimentalPoints);
    const targetAC = AbramsLawService.solveForAC(abramsResult, fcjTarget);
    
    // 3. Check NBR 6118 limits
    const limits = NBR6118Service.getDurabilityLimits(/*...*/);
    const warnings = [];
    if (targetAC > limits.acMax) {
      warnings.push('a/c ultrapassa limite normativo');
    }
    
    // 4. Apply Lyse and Molinari laws
    const targetM = LyseLawService.solve(/*...*/);
    const cementConsumption = MolinariLawService.solve(/*...*/);
    
    // 5. Return complete result
    return new TraceResult(/*...*/);
  }
}
```

### 3. Domain Layer (`src/core/domain/`)

**Responsibility:** Define entities, business rules, domain logic.

```typescript
// src/core/domain/entities/trace-result.ts
export class TraceResult {
  constructor(
    public readonly cement: number,
    public readonly sand: number,
    public readonly gravel: number,
    public readonly water: number
  ) {
    // Domain invariants
    if (cement <= 0) throw new Error('Invalid cement value');
  }
  
  toUnitTrace(): { cement: 1, sand: number, gravel: number, water: number } {
    return {
      cement: 1,
      sand: this.sand / this.cement,
      gravel: this.gravel / this.cement,
      water: this.water / this.cement
    };
  }
}
```

### 4. Infrastructure Layer (`src/core/infrastructure/`)

**Responsibility:** Implement technical details, external integrations.

```typescript
// src/core/infrastructure/math/linear-regression.service.ts
export class LinearRegressionService {
  static fit(points: Point[]): RegressionResult {
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    // ... least squares implementation
    return { slope, intercept, r2 };
  }
}
```

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                           │
└──────────────────────────────────────────────────────────────┘

Browser/Client
     │
     ▼ POST /api/v1/dosage
┌──────────────────────────────────────────────────────────────┐
│ API Route (route.ts)                                         │
│   1. Parse JSON body                                         │
│   2. Validate with Zod schema                                │
│   3. Transform to domain types                               │
└──────────────────────────────────────────────────────────────┘
     │
     ▼ CalculateDosageUseCase.execute()
┌──────────────────────────────────────────────────────────────┐
│ Use Case                                                      │
│   1. NBR12655Service.calculateFcjTarget()                    │
│   2. AbramsLawService.fit() → coefficients                   │
│   3. AbramsLawService.solveForAC() → target a/c              │
│   4. NBR6118Service.checkLimits() → warnings                 │
│   5. LyseLawService.solve() → target m                       │
│   6. MolinariLawService.solve() → cement consumption         │
│   7. Build TraceResult                                        │
└──────────────────────────────────────────────────────────────┘
     │
     ▼ Response.json()
┌──────────────────────────────────────────────────────────────┐
│ API Route (route.ts)                                         │
│   1. Format response                                         │
│   2. Add metadata                                            │
│   3. Return JSON                                             │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
Browser/Client
```

---

## Design Decisions

### 1. Pure TypeScript Math

We use pure TypeScript implementations instead of external math libraries:

**Pros:**
- Smaller bundle size
- No external dependencies
- Full auditability
- Type safety

**Cons:**
- More development time
- Manual optimization needed

### 2. Zod for Validation

We use Zod for runtime validation:

```typescript
// Compile-time AND runtime type safety
const schema = z.object({
  fck: z.number().min(10).max(100)
});

type Target = z.infer<typeof schema>; // TypeScript type
const validated = schema.parse(data); // Runtime validation
```

### 3. Edge Runtime

The API route is configured for Edge Runtime:

```typescript
export const runtime = 'edge';
```

**Benefits:**
- Faster cold starts
- Global distribution
- Lower latency

---

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Testing Pyramid                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────┐                              │
│                    │   E2E   │  Browser/API tests           │
│                    └────┬────┘                              │
│                   ┌─────┴─────┐                             │
│                   │Integration│  Use case tests             │
│                   └─────┬─────┘                             │
│              ┌──────────┴──────────┐                        │
│              │      Unit Tests      │  Service tests        │
│              └──────────────────────┘                       │
│                                                             │
│  Tool: Vitest                                               │
│  Coverage: 80%+ target                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example Unit Test

```typescript
// tests/unit/abrams-law.service.test.ts
import { describe, it, expect } from 'vitest';
import { AbramsLawService } from '@/core/infrastructure/math/abrams-law.service';

describe('AbramsLawService', () => {
  it('should fit Abrams curve from experimental points', () => {
    const points = [
      { ac: 0.45, fcj: 42 },
      { ac: 0.58, fcj: 32 },
      { ac: 0.72, fcj: 22 }
    ];
    
    const result = AbramsLawService.fit(points);
    
    expect(result.k1).toBeCloseTo(125, 0);
    expect(result.k2).toBeCloseTo(11, 0);
    expect(result.r2).toBeGreaterThan(0.99);
  });
});
```

---

## Future Improvements

1. **Dependency Injection:** Implement IoC container for better testability
2. **Result Types:** Use Result<T, E> pattern for error handling
3. **Caching:** Add Redis/memory cache for repeated calculations
4. **Versioning:** Implement API versioning strategy
5. **OpenAPI:** Generate OpenAPI spec from Zod schemas
