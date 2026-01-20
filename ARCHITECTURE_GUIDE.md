# Samplecore Architecture & Codebase Guide

This guide explains how the Samplecore application works, what each file does, and how everything connects together.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Directory-by-Directory Breakdown](#directory-by-directory-breakdown)
5. [Data Flow](#data-flow)
6. [Key Patterns](#key-patterns)

---

## Overview

**Samplecore** is a Next.js 14 application for managing fashion/textile sample coordination. It helps track:
- **Production Items**: Conceptual products (e.g., "Denim Jacket X")
- **Sample Items**: Specific versions with stage, color, size, and revision
- **Inventory**: Physical locations and quantities of samples
- **Requests**: Teams requesting samples with lifecycle tracking
- **Comments**: Threaded discussions on items and requests

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React + TailwindCSS + shadcn/ui components
- **Validation**: Zod schemas
- **Language**: TypeScript

---

## Project Structure

```
samplecore/
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js pages and API routes
│   ├── components/     # React UI components
│   ├── lib/            # Utilities and helpers
│   └── services/       # Business logic layer
└── tests/              # Test files
```

---

## Core Concepts

### 1. **Production Items vs Sample Items**

- **ProductionItem**: The conceptual product (e.g., "Denim Jacket X")
  - Has a name, description
  - Can have multiple sample variations
  - Has its own comments

- **SampleItem**: A specific version of a product
  - Belongs to one ProductionItem
  - Has: stage (PROTOTYPE, DEVELOPMENT, PRODUCTION), color, size, revision
  - Unique constraint: `(productionItemId, stage, color, size, revision)`
  - Has its own inventory, comments, and requests

### 2. **View Modes**

- **Product View**: Shows all samples for a product, aggregated inventory, all requests
- **Sample View**: Shows details for one specific sample item

### 3. **Request Lifecycle**

```
REQUESTED → APPROVED → SHIPPED/HANDED_OFF → IN_USE → RETURNED → CLOSED
```

### 4. **Inventory Locations**

Samples are stored in physical locations (enum):
- STUDIO_A, STUDIO_B
- WAREHOUSE_A, WAREHOUSE_B, WAREHOUSE_C
- SHOWROOM, PHOTO_STUDIO, OFFICE

---

## Directory-by-Directory Breakdown

### `/prisma/` - Database Layer

#### `schema.prisma`
**Purpose**: Defines the database structure
- **Models**: ProductionItem, SampleItem, SampleInventory, Team, SampleRequest, Comment, AuditEvent
- **Enums**: SampleStage, InventoryLocation, SampleColor, SampleSize, RequestStatus
- **Relationships**: Defines how models connect (one-to-many, many-to-one)
- **Constraints**: Unique constraints, indexes, cascade deletes

**Key Relationships**:
```
ProductionItem → has many → SampleItem
SampleItem → has many → SampleInventory
SampleItem → has many → SampleRequest
SampleItem → has many → Comment
Team → has many → SampleRequest
```

#### `migrations/`
**Purpose**: Database migration history
- Each folder = one migration
- Contains SQL to alter database structure
- Applied in order to update database schema

#### `seed.ts`
**Purpose**: Populates database with test data
- Creates teams, production items, sample items, inventory, requests
- Run with: `npm run db:seed`

---

### `/src/app/` - Next.js App Router

Next.js uses file-based routing. Files here become pages or API endpoints.

#### `/app/(main)/` - Main Application Pages

The `(main)` folder is a **route group** - it doesn't affect the URL but groups related pages.

##### `/app/(main)/layout.tsx`
**Purpose**: Shared layout for all main pages
- Wraps pages with sidebar navigation
- Provides consistent structure

##### `/app/(main)/page.tsx`
**Purpose**: Home/Dashboard page
- Shows statistics: total requests, pending, in use, production items
- Server Component (fetches data on server)

##### `/app/(main)/inventory/` - Inventory Pages

**`page.tsx`**
- Main inventory listing page
- Shows grid of inventory cards
- Includes filters (stage, color, size)
- Server Component

**`layout.tsx`**
- Wraps inventory pages with layout
- Handles parallel routes for modals

**`@modal/`** - Parallel Route for Modals
- Next.js feature: shows modal overlay without changing URL
- `(.)sample/[id]/page.tsx`: Intercepts `/inventory/sample/[id]` to show as modal
- `default.tsx`: Renders when no modal should show

**`sample/[id]/page.tsx`**
- Full-page view of a sample item
- Used when navigating directly (not as modal)

##### `/app/(main)/requests/` - Request Pages

Similar structure to inventory:
- `page.tsx`: List of all requests
- `@modal/`: Modal view for request details
- `request/[id]/page.tsx`: Full-page view

##### `/app/(main)/teams/` - Team Pages

- `page.tsx`: List of teams
- `new/page.tsx`: Create new team
- `team/[id]/page.tsx`: Team details
- `@modal/`: Modal views

#### `/app/api/` - API Routes

These are **Server API endpoints** that handle HTTP requests.

**Pattern**: Each folder = one endpoint
- `route.ts` = handles GET, POST, etc.
- `[id]/route.ts` = handles operations on specific ID

##### `/app/api/inventory/`
- `route.ts`: POST - Add inventory to sample
- `filters/route.ts`: GET - Get unique colors/sizes for filters
- `production-items/route.ts`: GET, POST - List/create production items
- `production-items/[id]/route.ts`: GET, PATCH - Get/update production item
- `samples/route.ts`: POST - Create sample item
- `samples/batch/route.ts`: POST - Create multiple samples with inventory
- `samples/[id]/route.ts`: GET, PATCH - Get/update sample item

##### `/app/api/requests/`
- `route.ts`: GET, POST - List/create requests
- `[id]/route.ts`: GET, PATCH - Get/update request

##### `/app/api/comments/`
- `route.ts`: POST - Create comment
- `[id]/route.ts`: PATCH, DELETE - Update/delete comment

##### `/app/api/teams/`
- `route.ts`: GET, POST - List/create teams
- `[id]/route.ts`: GET, PATCH, DELETE - Team operations

#### `/app/layout.tsx`
**Purpose**: Root layout for entire app
- Sets up HTML structure, fonts, global styles
- Wraps all pages

#### `/app/not-found.tsx`
**Purpose**: 404 error page
- Shows when page not found

#### `/app/globals.css`
**Purpose**: Global CSS styles
- TailwindCSS imports
- Custom CSS variables

---

### `/src/components/` - React Components

All UI components live here, organized by feature.

#### `/components/ui/` - Base UI Components

**Purpose**: Reusable shadcn/ui components
- `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, etc.
- These are building blocks used throughout the app
- Based on Radix UI primitives + TailwindCSS

#### `/components/layout/` - Layout Components

**`sidebar.tsx`**
- Main navigation sidebar
- Shows links: Home, Inventory, Requests, Teams
- Used in `(main)/layout.tsx`

#### `/components/inventory/` - Inventory Feature Components

**`inventory-card.tsx`**
- Card showing one inventory item
- Displays: product name, stage, color, size, available quantity
- Clickable → opens sample detail view

**`inventory-filters.tsx`**
- Filter dropdowns: Stage, Color, Size
- Updates URL params to filter inventory list
- Client Component (uses `useSearchParams`)

**`sample-detail-content.tsx`**
- **Most complex component** - shows sample/product details
- Handles both "product view" and "sample view" modes
- Shows: inventory by location, comments, requests, filter variations
- Manages state for collapsed sections, filters, view mode
- Client Component (lots of interactivity)

**`sample-detail-modal.tsx`**
- Wrapper for modal view of sample details
- Uses `SampleDetailContent` inside a Dialog
- Handles opening/closing modal

**`sample-detail-page.tsx`**
- Wrapper for full-page view of sample details
- Uses `SampleDetailContent` directly
- No modal wrapper

**`create-production-item-dialog.tsx`**
- Dialog form to create new production item
- Client Component with form handling

**`create-sample-item-dialog.tsx`**
- Dialog form to create new sample item(s)
- Can create multiple variations at once
- Can create new production item on the fly
- Client Component

**`create-sample-item-button.tsx`**
- Button that opens `CreateSampleItemDialog`
- Simple wrapper component

**`add-inventory-dialog.tsx`**
- Dialog form to add inventory to existing sample
- Allows specifying quantity and location
- Client Component

#### `/components/requests/` - Request Feature Components

**`requests-list.tsx`**
- Displays list of requests
- Shows request cards with status, team, sample info
- Server Component (receives data as props)

**`request-detail-content.tsx`**
- Shows full request details
- Displays: sample item info, request details, comments
- Allows editing request and updating status
- Client Component

**`request-detail-modal.tsx`** & **`request-detail-page.tsx`**
- Modal and full-page wrappers (similar to sample detail)

**`create-request-dialog.tsx`**
- Dialog form to create new request
- Client Component

**`create-request-button.tsx`**
- Button wrapper

**`request-status-filter.tsx`**
- Filter dropdown for request status
- Updates URL params
- Client Component

#### `/components/teams/` - Team Feature Components

Similar pattern to requests:
- `teams-list.tsx`: List of teams
- `team-detail-content.tsx`: Team details
- `team-form.tsx`: Create/edit team form
- Modal and page wrappers

#### `/components/comments/` - Comment Components

**`comment-form.tsx`**
- Form to create new comment
- Can be reply to another comment (parentId)
- Client Component

**`comment-thread.tsx`**
- Displays a comment and its replies (nested)
- Handles collapsed/expanded state
- Recursively renders nested replies
- Client Component

---

### `/src/lib/` - Utilities & Helpers

#### `db.ts`
**Purpose**: Prisma database client singleton
- Exports `db` - the Prisma client instance
- Ensures only one connection pool

**Usage**: `import { db } from "@/lib/db"`

#### `validations.ts`
**Purpose**: Zod validation schemas
- Defines schemas for all form inputs
- Used for API route validation
- Ensures type safety

**Key Schemas**:
- `CreateProductionItemSchema`
- `CreateSampleItemSchema`
- `CreateInventorySchema`
- `CreateRequestSchema`
- Enum schemas: `InventoryLocationSchema`, `SampleColorSchema`, `SampleSizeSchema`

#### `errors.ts`
**Purpose**: Error handling utilities
- `handleUniqueConstraintError()`: Converts Prisma unique constraint errors to user-friendly messages
- Shows which fields conflict

#### `utils.ts`
**Purpose**: General utilities
- `cn()`: Merges TailwindCSS classes
- `formatDate()`: Formats dates for display

#### `index.ts`
**Purpose**: Centralized exports for cleaner imports
- Re-exports all utilities from other lib files
- Allows: `import { formatColor, formatSize, cn } from "@/lib"`

#### `types.ts`
**Purpose**: Centralized Prisma type definitions
- Eliminates duplicate type definitions across components
- Key types: `SampleItemWithRelations`, `ProductionItemWithSamples`, `RequestWithRelations`, `TeamWithRequests`

#### Enum Utility Files

Each enum has a utility file with:
- **Labels**: Human-readable display names
- **Options**: Array for dropdowns `[{ value, label }]`
- **Format function**: Converts enum to label
- **Variant function**: Badge color variant

| File | Enum | Format Function |
|------|------|-----------------|
| `color-utils.ts` | SampleColor | `formatColor()` |
| `size-utils.ts` | SampleSize | `formatSize()` |
| `location-utils.ts` | InventoryLocation | `formatLocation()` |
| `stage-utils.ts` | SampleStage | `formatStage()`, `getStageVariant()` |
| `status-utils.ts` | RequestStatus | `formatStatus()`, `getStatusVariant()` |
| `inventory-status-utils.ts` | InventoryStatus | `formatInventoryStatus()`, `getInventoryStatusVariant()` |

#### `api-utils.ts`
**Purpose**: Standardized API response helpers
- `successResponse()`, `createdResponse()`, `errorResponse()`, `notFoundResponse()`
- `handleApiError()`: Consistent error handling for API routes
- `withErrorHandling()`: Wrapper for API handlers

#### `color-utils.ts`
**Purpose**: Color enum utilities
- `COLOR_LABELS`: Maps enum values to display names
- `formatColor()`: Formats color for display
- `COLOR_OPTIONS`: Array for dropdowns

#### `size-utils.ts`
**Purpose**: Size enum utilities
- Similar to color-utils
- `SIZE_LABELS`, `formatSize()`, `SIZE_OPTIONS`

#### `auth.ts`
**Purpose**: Authentication utilities (mocked for MVP)
- `getCurrentUser()`: Returns mock user
- In production, would use NextAuth or similar

---

### `/src/services/` - Business Logic Layer

**Purpose**: All database operations and business logic
- Services are classes with static methods
- Called by API routes
- Handles Prisma queries, error handling, audit logging

#### `inventory.ts` - InventoryService

**Methods**:
- `getProductionItemsWithSamples()`: Get all products with their samples
- `getProductionItemById()`: Get one product with all relations
- `createProductionItem()`: Create new product
- `createSampleItemsWithInventory()`: Batch create samples with inventory
- `getUniqueColorsAndSizes()`: Get filter options

**Pattern**: Returns Prisma payload types with all relations included

#### `requests.ts` - RequestsService

**Methods**:
- `getAllRequests()`: Get all requests with relations
- `getRequestById()`: Get one request
- `createRequest()`: Create new request
- `updateRequest()`: Update request
- `getRequestStats()`: Get statistics (total, by status)

#### `teams.ts` - TeamsService

**Methods**:
- `getAllTeams()`: List all teams
- `getTeamById()`: Get one team
- `createTeam()`: Create team
- `updateTeam()`: Update team
- `deleteTeam()`: Delete team

#### `comments.ts` - CommentsService

**Methods**:
- `createComment()`: Create comment (can be reply)
- `getCommentsForSampleItem()`: Get comments for sample
- `getCommentsForRequest()`: Get comments for request
- Handles nested replies

#### `audit.ts` - AuditService

**Methods**:
- `createAuditEvent()`: Log important actions
- Tracks: CREATED, UPDATED, DELETED, STATUS_CHANGED
- Used by other services to maintain audit trail

---

## Data Flow

### Example: Creating a New Sample Item

1. **User clicks "Add Inventory Item"** → Opens `CreateSampleItemDialog`

2. **User fills form** → Client Component manages form state

3. **User submits** → Makes POST request to `/api/inventory/samples/batch`

4. **API Route** (`/app/api/inventory/samples/batch/route.ts`):
   - Validates input with Zod schema
   - Calls `InventoryService.createSampleItemsWithInventory()`

5. **Service** (`/src/services/inventory.ts`):
   - Creates ProductionItem (if new)
   - Creates SampleItem(s)
   - Creates SampleInventory records
   - Creates AuditEvent
   - Returns created data

6. **API Route**:
   - Returns JSON response

7. **Client Component**:
   - Receives response
   - Closes dialog
   - Refreshes inventory list (or navigates)

### Example: Viewing Inventory

1. **User navigates to `/inventory`**

2. **Server Component** (`/app/(main)/inventory/page.tsx`):
   - Reads URL search params (filters)
   - Calls `InventoryService.getProductionItemsWithSamples(filters)`
   - Renders `InventoryFilters` and `InventoryCard` components

3. **User clicks inventory card**:
   - Navigates to `/inventory/sample/[id]?view=product`

4. **Parallel Route** (`@modal/(.)sample/[id]/page.tsx`):
   - Intercepts route
   - Shows `SampleDetailModal` (which uses `SampleDetailContent`)

5. **SampleDetailContent**:
   - Fetches sample data via API
   - Manages view mode (product vs sample)
   - Shows inventory, comments, requests

---

## Key Patterns

### 1. **Server Components vs Client Components**

- **Server Components** (default):
  - Run on server
  - Can directly access database
  - No `"use client"` directive
  - Used for: data fetching, static content

- **Client Components** (`"use client"`):
  - Run in browser
  - Can use hooks (`useState`, `useEffect`, etc.)
  - Used for: interactivity, forms, modals

### 2. **Parallel Routes for Modals**

Next.js feature that allows modals without changing URL:
- `@modal/` folder = parallel route
- `(.)` = intercepts sibling route
- Allows smooth modal transitions

### 3. **Service Layer Pattern**

- All database operations in services
- Services called by API routes
- Services handle business logic, validation, audit logging
- Keeps API routes thin

### 4. **Type Safety with Prisma**

- Prisma generates TypeScript types
- Use `Prisma.XGetPayload<{ include: ... }>` for custom types
- Ensures type safety throughout app

### 5. **URL State for Filters**

- Filters stored in URL search params
- Shareable, bookmarkable
- No global state needed
- Example: `/inventory?stage=PRODUCTION&color=NAVY`

### 6. **Enum Normalization**

- Colors, sizes, locations are enums in database
- Utility files (`color-utils.ts`, `size-utils.ts`) provide:
  - Display labels
  - Formatting functions
  - Dropdown options

---

## File Relationships

### Inventory Flow

```
inventory/page.tsx
  → InventoryFilters (reads/writes URL params)
  → InventoryCard (links to sample detail)
    → @modal/(.)sample/[id]/page.tsx
      → SampleDetailModal
        → SampleDetailContent (main logic)
          → AddInventoryDialog
          → CreateSampleItemDialog
          → CommentThread
```

### Request Flow

```
requests/page.tsx
  → RequestsList
    → RequestCard (links to request detail)
      → @modal/(.)request/[id]/page.tsx
        → RequestDetailModal
          → RequestDetailContent
            → CommentThread
```

### API → Service → Database

```
API Route (/app/api/.../route.ts)
  → Validates with Zod schema
  → Calls Service method
    → Service (/src/services/...ts)
      → Queries Prisma (db)
      → Creates AuditEvent
      → Returns data
  → API returns JSON response
```

---

## Common Tasks

### Adding a New Field

1. Update `prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Update Zod schema in `lib/validations.ts`
4. Update service methods
5. Update UI components

### Adding a New Page

1. Create file in `/app/(main)/[feature]/page.tsx`
2. Create components in `/components/[feature]/`
3. Add API routes if needed
4. Add service methods if needed

### Adding a New Feature

1. **Database**: Update schema, migrate
2. **Validation**: Add Zod schemas
3. **Service**: Add business logic methods
4. **API**: Add API routes
5. **Components**: Add UI components
6. **Pages**: Add pages/routes

---

## Summary

- **`/prisma/`**: Database schema and migrations
- **`/src/app/`**: Pages and API routes (Next.js routing)
- **`/src/components/`**: React UI components
- **`/src/lib/`**: Utilities, helpers, validations
- **`/src/services/`**: Business logic and database operations

**Data flows**: User → Component → API Route → Service → Database

**Key principle**: Separation of concerns - UI in components, logic in services, validation in schemas.

