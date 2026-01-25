# Samplecore - Pre-Implementation Improvements Checklist

This document outlines improvements, missing pieces, and technical debt that should be addressed before implementing new features.

## 🚨 Critical Improvements

### 1. **Standardize API Error Handling**
**Status**: ⚠️ Inconsistent
- **Issue**: API routes have custom error handling instead of using `api-utils.ts` helpers
- **Impact**: Inconsistent error responses, harder to maintain
- **Files to Update**:
  - `src/app/api/inventory/route.ts`
  - `src/app/api/inventory/production-items/route.ts`
  - `src/app/api/inventory/samples/route.ts`
  - `src/app/api/inventory/samples/batch/route.ts`
  - `src/app/api/requests/route.ts`
  - `src/app/api/teams/route.ts`
  - `src/app/api/comments/route.ts`
  - All `[id]/route.ts` files
- **Action**: Refactor all API routes to use `handleApiError()` and response helpers from `api-utils.ts`

### 2. **Create .env.example File**
**Status**: ❌ Missing
- **Issue**: README references `.env.example` but file doesn't exist
- **Impact**: New developers don't know what environment variables are needed
- **Action**: Create `.env.example` with:
  ```env
  DATABASE_URL="postgresql://user:password@localhost:5432/samplecore"
  NODE_ENV="development"
  ```

### 3. **Add Input Sanitization**
**Status**: ⚠️ Partial
- **Issue**: Zod validation exists but no HTML/XSS sanitization
- **Impact**: Potential security vulnerabilities in user inputs (comments, notes, etc.)
- **Action**: 
  - Add sanitization library (e.g., `dompurify` for client, `sanitize-html` for server)
  - Sanitize all text inputs before saving to database
  - Especially important for: comments, notes, descriptions

## 📝 Code Quality Improvements

### 4. **Add Type Safety for API Responses**
**Status**: ⚠️ Partial
- **Issue**: API responses aren't typed, making it harder to catch errors
- **Action**: 
  - Create TypeScript types for all API responses
  - Use `satisfies` or explicit return types in API routes
  - Export types from `lib/types.ts`

### 5. **Add Request Validation Middleware**
**Status**: ❌ Missing
- **Issue**: Each route manually validates with try/catch
- **Action**: Create reusable middleware for:
  - Request body validation
  - Query parameter validation
  - Authentication checks (when auth is implemented)

### 6. **Improve Error Messages**
**Status**: ⚠️ Basic
- **Issue**: Some error messages are generic or not user-friendly
- **Action**:
  - Add more specific error messages for common scenarios
  - Use error codes for client-side error handling
  - Add error logging with context (user, action, timestamp)

## 🧪 Testing Improvements

### 7. **Expand Test Coverage**
**Status**: ⚠️ Limited (only 4 test files)
- **Missing Tests**:
  - `tests/unit/services/comments.test.ts`
  - `tests/unit/services/teams.test.ts`
  - `tests/unit/services/audit.test.ts`
  - `tests/integration/api/` - API route integration tests
  - `tests/e2e/` - More E2E scenarios:
    - Team creation flow
    - Comment threading
    - Request status transitions
    - Inventory filtering
- **Action**: Add comprehensive test coverage for all services and critical user flows

### 8. **Add Test Utilities**
**Status**: ❌ Missing
- **Issue**: No test helpers for common operations
- **Action**: Create `tests/utils/` with:
  - Database seeding helpers
  - Mock data factories
  - API request helpers
  - Test user helpers

### 9. **Add Test Coverage Reporting**
**Status**: ❌ Missing
- **Action**: 
  - Add `@vitest/coverage-v8` or similar
  - Configure coverage thresholds
  - Add coverage script to package.json

## 🔒 Security Improvements

### 10. **Rate Limiting**
**Status**: ❌ Missing
- **Issue**: No protection against API abuse
- **Action**: 
  - Add rate limiting middleware (e.g., `@upstash/ratelimit`)
  - Configure limits per endpoint type
  - Add to critical endpoints (create, update, delete)

### 11. **CSRF Protection**
**Status**: ❌ Missing
- **Issue**: No CSRF tokens for state-changing operations
- **Action**: 
  - Add CSRF protection when implementing real auth
  - Use Next.js built-in CSRF or `csurf` middleware

### 12. **SQL Injection Prevention**
**Status**: ✅ Good (using Prisma)
- **Note**: Prisma provides protection, but ensure all queries use Prisma, not raw SQL

### 13. **Input Length Limits**
**Status**: ⚠️ Partial
- **Issue**: Some fields have max lengths in Zod, but not all
- **Action**: Review and add max lengths to all text fields:
  - Comments: ✅ (2000 chars)
  - Notes: ⚠️ (check all note fields)
  - Descriptions: ⚠️ (check)
  - Names: ⚠️ (check)

## 📊 Performance Improvements

### 14. **Add Database Query Optimization**
**Status**: ⚠️ Basic
- **Issue**: Some queries might be N+1 or inefficient
- **Action**:
  - Review all service methods for N+1 queries
  - Add `select` statements to limit returned fields
  - Add database indexes for common query patterns (check if all needed indexes exist)
  - Use Prisma's `include` strategically

### 15. **Add Caching Strategy**
**Status**: ❌ Missing
- **Issue**: No caching for frequently accessed data
- **Action**:
  - Add React `cache()` for server components
  - Consider Redis for API response caching
  - Add cache headers for static data

### 16. **Pagination Consistency**
**Status**: ⚠️ Inconsistent
- **Issue**: Some endpoints paginate, others don't
- **Action**: 
  - Review all list endpoints
  - Add pagination to endpoints that return arrays
  - Standardize pagination response format

## 🛠️ Developer Experience

### 17. **Add Pre-commit Hooks**
**Status**: ❌ Missing
- **Action**: 
  - Add `husky` and `lint-staged`
  - Run linting and formatting on commit
  - Optionally run tests

### 18. **Add More npm Scripts**
**Status**: ⚠️ Basic
- **Missing Scripts**:
  - `npm run type-check` - TypeScript checking without building
  - `npm run test:coverage` - Run tests with coverage
  - `npm run db:reset` - Reset and seed database
  - `npm run db:migrate:reset` - Reset migrations
- **Action**: Add helpful development scripts

### 19. **Add CI/CD Pipeline**
**Status**: ❌ Missing
- **Action**: 
  - Add GitHub Actions (or similar) workflow
  - Run tests on PR
  - Run linting and type checking
  - Optionally deploy on merge to main

### 20. **Improve Logging**
**Status**: ⚠️ Basic (console.log/error)
- **Action**:
  - Add structured logging library (e.g., `pino`, `winston`)
  - Add log levels (debug, info, warn, error)
  - Add request ID tracking
  - Log important operations (create, update, delete)

## 📚 Documentation Improvements

### 21. **API Documentation**
**Status**: ❌ Missing
- **Action**: 
  - Document all API endpoints
  - Add request/response examples
  - Use OpenAPI/Swagger or simple markdown file

### 22. **Component Documentation**
**Status**: ⚠️ Basic
- **Action**: 
  - Add JSDoc comments to complex components
  - Document component props
  - Add usage examples

### 23. **Database Schema Documentation**
**Status**: ⚠️ Basic (in README)
- **Action**: 
  - Add ER diagram
  - Document relationships more clearly
  - Add data flow diagrams

## 🎯 Feature Completeness

### 24. **Error Boundary Coverage**
**Status**: ✅ Exists but could be improved
- **Action**: 
  - Ensure all pages have error boundaries
  - Add error boundaries to critical sections
  - Improve error recovery UX

### 25. **Loading States**
**Status**: ⚠️ Partial
- **Issue**: Some components have loading states, others don't
- **Action**: 
  - Review all async operations
  - Add loading skeletons/spinners consistently
  - Use React Suspense where appropriate

### 26. **Optimistic Updates**
**Status**: ⚠️ Partial (only in request status)
- **Action**: 
  - Add optimistic updates for:
    - Comment creation
    - Inventory updates
    - Team updates
  - Improve UX with immediate feedback

## 🔄 Data Integrity

### 27. **Add Database Constraints**
**Status**: ✅ Good (Prisma schema has constraints)
- **Note**: Review if any business logic constraints are missing

### 28. **Add Soft Deletes**
**Status**: ❌ Missing
- **Issue**: Hard deletes lose audit trail
- **Action**: 
  - Consider adding `deletedAt` field to important models
  - Add soft delete functionality
  - Or ensure audit trail captures all deletions

### 29. **Add Data Validation at Service Layer**
**Status**: ⚠️ Partial
- **Issue**: Validation only at API layer
- **Action**: 
  - Add business rule validation in services
  - Validate relationships (e.g., can't create request for non-existent sample)
  - Add transaction support for multi-step operations

## 📦 Dependencies & Maintenance

### 30. **Audit Dependencies**
**Status**: ⚠️ Unknown
- **Action**: 
  - Run `npm audit` to check for vulnerabilities
  - Update outdated dependencies
  - Review and remove unused dependencies

### 31. **Add Dependency Update Automation**
**Status**: ❌ Missing
- **Action**: 
  - Use Dependabot or Renovate
  - Configure for security updates

## 🎨 UI/UX Improvements

### 32. **Accessibility Audit**
**Status**: ⚠️ Unknown
- **Action**: 
  - Run accessibility audit (axe, Lighthouse)
  - Fix ARIA labels
  - Ensure keyboard navigation works
  - Test with screen readers

### 33. **Mobile Responsiveness**
**Status**: ⚠️ Unknown
- **Action**: 
  - Test on mobile devices
  - Ensure modals work on mobile
  - Test touch interactions

### 34. **Add Toast Notifications**
**Status**: ⚠️ Partial (toast component exists)
- **Action**: 
  - Ensure all success/error actions show toasts
  - Add consistent toast styling
  - Add toast for important actions (create, update, delete)

## 🚀 Production Readiness

### 35. **Environment Configuration**
**Status**: ⚠️ Basic
- **Action**: 
  - Add environment variable validation on startup
  - Use `zod` to validate env vars
  - Fail fast if required vars are missing

### 36. **Health Check Endpoint**
**Status**: ❌ Missing
- **Action**: 
  - Add `/api/health` endpoint
  - Check database connectivity
  - Return service status

### 37. **Add Monitoring**
**Status**: ❌ Missing
- **Action**: 
  - Add error tracking (Sentry, LogRocket, etc.)
  - Add performance monitoring
  - Add uptime monitoring

### 38. **Database Backup Strategy**
**Status**: ⚠️ Not documented
- **Action**: 
  - Document backup strategy
  - Add backup scripts if needed
  - Test restore process

## 📋 Summary by Priority

### High Priority (Do Before New Features)
1. ✅ Standardize API error handling
2. ✅ Create .env.example
3. ✅ Add input sanitization
4. ✅ Expand test coverage (at least critical paths)
5. ✅ Add rate limiting

### Medium Priority (Should Do Soon)
6. ✅ Add pre-commit hooks
7. ✅ Add CI/CD pipeline
8. ✅ Improve logging
9. ✅ Add health check endpoint
10. ✅ Add API documentation

### Low Priority (Nice to Have)
11. ✅ Add caching strategy
12. ✅ Add soft deletes
13. ✅ Add monitoring
14. ✅ Accessibility audit

## 🎯 Recommended Order

1. **Week 1**: Critical improvements (#1-5)
2. **Week 2**: Testing and DX (#7-9, #17-19)
3. **Week 3**: Security and performance (#10-11, #14-16)
4. **Week 4**: Documentation and polish (#21-23, #32-34)

---

**Note**: This checklist is comprehensive. Prioritize based on your immediate needs and timeline. Some items (like auth implementation) are already noted as future work in the README.
