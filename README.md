# Samplecore

Production workflow web application for sample coordination in fashion/textile production.

## Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS + shadcn/ui components
- **Validation**: Zod schemas
- **Testing**: Vitest (unit/integration) + Playwright (e2e)
- **Linting/Formatting**: ESLint + Prettier

### Folder Structure

```
samplecore/
├── prisma/
│   ├── schema.prisma          # Database schema with models, enums, constraints
│   ├── migrations/             # Prisma migrations
│   └── seed.ts                 # Seed script for development data
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (main)/            # Main layout group with sidebar
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Home dashboard
│   │   │   ├── inventory/     # Inventory grid + route-based modal
│   │   │   │   ├── @modal/   # Parallel route for modals
│   │   │   │   └── sample/[id]/
│   │   │   │   └── sample/[id]/  # Full page detail
│   │   │   ├── requests/      # Requests list
│   │   │   └── teams/         # Teams CRUD
│   │   └── api/               # API routes (server actions)
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Layout components (sidebar, etc.)
│   │   ├── inventory/         # Inventory-specific components
│   │   ├── requests/          # Request components
│   │   └── teams/             # Team components
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Auth utilities (mocked for MVP)
│   │   ├── validations.ts     # Zod schemas
│   │   └── utils.ts           # Utility functions
│   └── services/              # Business logic layer
│       ├── audit.ts           # Audit event service
│       ├── inventory.ts       # Inventory/sample management
│       ├── requests.ts         # Request lifecycle
│       ├── teams.ts            # Team CRUD
│       └── comments.ts         # Comment management
└── tests/
    ├── unit/                  # Unit tests (Vitest)
    ├── integration/           # Integration tests (Vitest)
    └── e2e/                   # End-to-end tests (Playwright)
```

### Design Principles

1. **Database-First**: Strong relational modeling with proper constraints, indexes, and auditability
2. **Separation of Concerns**: Business logic in services, UI in components, validation in schemas
3. **Type Safety**: Full TypeScript coverage with Prisma-generated types
4. **Server Components**: Prefer server components; use client components only when needed
5. **Route-Based Modals**: Use Next.js parallel routes for smooth modal transitions
6. **DRY Code**: Reusable components, consistent patterns, typed boundaries

## Database Schema

### Core Models

- **ProductionItem**: Conceptual product (e.g., "Denim Jacket X")
- **SampleItem**: Specific versions with stage, color, size, revision
- **SampleInventory**: Counts and locations of sample items
- **Team**: Groups that request samples (internal/external)
- **SampleRequest**: Request lifecycle (REQUESTED → APPROVED → SHIPPED/HANDED_OFF → IN_USE → RETURNED → CLOSED)
- **Comment**: Comments on sample items and requests
- **AuditEvent**: Append-only log of important actions

### Key Constraints

- Unique constraint on `(productionItemId, stage, color, size, revision)` for sample items
- Cascade deletes: sample items → inventory, comments
- Restrict deletes: requests cannot delete if sample item/team exists
- Check constraint: comments must have either `sampleItemId` or `requestId`

### Indexes

- Production items: `name`, `createdAt`
- Sample items: `productionItemId`, `stage`, `createdAt`
- Inventory: `sampleItemId`, `status`, `location`
- Requests: `sampleItemId`, `teamId`, `status`, `requestedAt`
- Audit events: `(entityType, entityId)`, `userId`, `createdAt`, `action`

## Conventions

### Naming

- **Files**: kebab-case for files, PascalCase for components
- **Components**: PascalCase, descriptive names
- **Services**: Class-based static methods (e.g., `InventoryService.getProductionItems()`)
- **API Routes**: RESTful naming (`/api/teams`, `/api/teams/[id]`)

### Code Organization

- **Services**: All database operations and business logic
- **Components**: UI only, minimal logic
- **Validations**: Zod schemas in `lib/validations.ts`
- **Types**: Use Prisma-generated types, export custom types from validations

### Server vs Client Components

- **Server Components** (default): Data fetching, server-side rendering
- **Client Components** (`"use client"`): Interactivity, hooks, browser APIs

### Error Handling

- Services throw errors; API routes catch and return appropriate status codes
- Client components show user-friendly error messages
- Use Zod for input validation with clear error messages

### Audit Trail

- Every important write operation creates an `AuditEvent`
- Include relevant metadata (status changes, quantities, etc.)
- Use consistent action names: `CREATED`, `UPDATED`, `DELETED`, `STATUS_CHANGED`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed database
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes (dev)
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run unit/integration tests
- `npm run test:e2e` - Run Playwright e2e tests

## Testing Strategy

### Unit Tests (Vitest)

- Test service layer methods in isolation
- Mock database calls or use test database
- Location: `tests/unit/`

### Integration Tests (Vitest)

- Test database schema, constraints, relationships
- Use test database with transactions
- Location: `tests/integration/`

### E2E Tests (Playwright)

- Test critical user flows end-to-end
- Example: Inventory → Modal → Create Request
- Location: `tests/e2e/`

## Development Workflow

1. **Create feature branch**
2. **Update Prisma schema** if needed → run migrations
3. **Implement service layer** → add tests
4. **Implement UI components** → add e2e tests if critical flow
5. **Run tests**: `npm test && npm run test:e2e`
6. **Format code**: `npm run format`
7. **Commit**: Clear, descriptive commit messages

## Future Enhancements

- Authentication (NextAuth.js)
- Background jobs (BullMQ, etc.)
- Full-text search (PostgreSQL FTS or Elasticsearch)
- File uploads (S3, Cloudinary)
- Real-time updates (WebSockets)
- Advanced filtering and search
- Export/import functionality
- Email notifications

## License

Internal tool - proprietary

