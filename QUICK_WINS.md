# Quick Wins - Easy Improvements You Can Do Now

These are improvements that can be implemented quickly (1-2 hours each) and will have immediate impact.

## 1. Create .env.example ✅
**Time**: 5 minutes
**Status**: Done
- Created `.env.example` file with required environment variables

## 2. Standardize API Error Handling
**Time**: 1-2 hours
**Impact**: High - Better error handling, easier maintenance

**Steps**:
1. Update all API routes to use `handleApiError()` from `api-utils.ts`
2. Replace manual try/catch with standardized helpers
3. Test error scenarios

**Example**:
```typescript
// Before
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);
    const result = await Service.create(validated);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// After
import { handleApiError, createdResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);
    const result = await Service.create(validated);
    return createdResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 3. Add Type Check Script
**Time**: 5 minutes
**Impact**: Medium - Catch type errors early

Add to `package.json`:
```json
"type-check": "tsc --noEmit"
```

## 4. Add Test Coverage Script
**Time**: 10 minutes
**Impact**: Medium - Track test coverage

1. Install: `npm install -D @vitest/coverage-v8`
2. Update `vitest.config.ts`:
```typescript
export default defineConfig({
  // ... existing config
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```
3. Add to `package.json`:
```json
"test:coverage": "vitest run --coverage"
```

## 5. Add Health Check Endpoint
**Time**: 15 minutes
**Impact**: Medium - Useful for monitoring

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
```

## 6. Add Pre-commit Hooks
**Time**: 20 minutes
**Impact**: High - Prevent bad commits

1. Install: `npm install -D husky lint-staged`
2. Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```
3. Initialize husky: `npx husky init`
4. Add pre-commit hook: `npx husky add .husky/pre-commit "npx lint-staged"`

## 7. Add Database Reset Script
**Time**: 5 minutes
**Impact**: Low - Developer convenience

Add to `package.json`:
```json
"db:reset": "prisma migrate reset --force && npm run db:seed"
```

## 8. Add Input Length Validation Review
**Time**: 30 minutes
**Impact**: Medium - Prevent data issues

Review all Zod schemas in `lib/validations.ts` and ensure:
- All text fields have `.max()` constraints
- Limits are reasonable for the use case
- Error messages are clear

## 9. Add More E2E Tests
**Time**: 1-2 hours
**Impact**: High - Catch integration issues

Add tests for:
- Team creation flow
- Comment creation and replies
- Request status transitions
- Inventory filtering

## 10. Add API Response Types
**Time**: 30 minutes
**Impact**: Medium - Better type safety

Create types for API responses in `lib/types.ts`:
```typescript
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};
```

Then use in API routes:
```typescript
export async function GET(): Promise<NextResponse<ApiResponse<Team[]>>> {
  // ...
}
```

---

## Priority Order

**Do First** (30 minutes total):
1. ✅ .env.example (done)
2. Type check script
3. Database reset script

**Do Next** (2-3 hours):
4. Standardize API error handling
5. Add health check endpoint
6. Add pre-commit hooks

**Do When You Have Time**:
7. Add test coverage
8. Add more E2E tests
9. Add API response types
10. Review input validation
