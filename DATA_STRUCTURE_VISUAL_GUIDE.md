# Data Structure Visual Guide

## 📊 Entity Relationship Diagram

```
┌─────────────────────┐
│  ProductionItem     │
│  ───────────────    │
│  • Denim Jacket X   │
│  • Summer Dress Y    │
└──────────┬──────────┘
           │
           │ 1:N (has many)
           │
           ▼
┌─────────────────────┐
│    SampleItem       │
│  ───────────────    │
│  • Stage: PRODUCTION│
│  • Color: BLACK     │
│  • Size: L         │
│  • Revision: A     │
└──────┬──────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       │ 1:N             │ 1:N             │ 1:N
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Inventory   │  │   Request    │  │   Comment    │
│  ──────────  │  │  ──────────  │  │  ──────────  │
│  • Qty: 10   │  │  • Status:   │  │  • "Looks   │
│  • Location: │  │    SHIPPED   │  │    great!"   │
│    WAREHOUSE │  │  • Qty: 2    │  │              │
│  • Status:   │  │              │  │              │
│    AVAILABLE │  │              │  │              │
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
                         │ N:1 (requested by)
                         │
                         ▼
                  ┌──────────────┐
                  │     Team     │
                  │  ──────────  │
                  │  • Design    │
                  │    Team      │
                  │  • Internal  │
                  └──────────────┘
```

---

## 🌳 Example: Complete Product Tree

```
ProductionItem: "Denim Jacket X"
│
├─ SampleItem #1
│  ├─ Stage: PROTOTYPE
│  ├─ Color: BLACK
│  ├─ Size: M
│  ├─ Revision: A
│  │
│  ├─ Inventory #1
│  │  ├─ Quantity: 3
│  │  ├─ Location: STUDIO_A
│  │  └─ Status: IN_USE
│  │
│  ├─ Inventory #2
│  │  ├─ Quantity: 2
│  │  ├─ Location: WAREHOUSE_A
│  │  └─ Status: AVAILABLE
│  │
│  └─ Request #1
│     ├─ Team: Design Team
│     ├─ Quantity: 1
│     ├─ Status: IN_USE
│     └─ Requested: 2024-01-15
│
├─ SampleItem #2
│  ├─ Stage: PRODUCTION
│  ├─ Color: NAVY
│  ├─ Size: L
│  ├─ Revision: B
│  │
│  ├─ Inventory #3
│  │  ├─ Quantity: 15
│  │  ├─ Location: WAREHOUSE_A
│  │  └─ Status: AVAILABLE
│  │
│  └─ Request #2
│     ├─ Team: Marketing Team
│     ├─ Quantity: 2
│     ├─ Status: SHIPPED
│     └─ Requested: 2024-01-20
│
└─ SampleItem #3
   ├─ Stage: DEVELOPMENT
   ├─ Color: BLACK
   ├─ Size: XL
   ├─ Revision: A
   │
   └─ Inventory #4
      ├─ Quantity: 5
      ├─ Location: STUDIO_B
      └─ Status: RESERVED
```

---

## 📋 Example: Request Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SampleRequest Lifecycle                  │
└─────────────────────────────────────────────────────────────┘

1. REQUESTED
   │
   │ Team: "Design Team" requests 2 units
   │ Sample: "Denim Jacket X - PRODUCTION, BLACK, L, Rev B"
   │
   ▼
   
2. APPROVED
   │
   │ Admin approves the request
   │ Inventory: Mark 2 units as RESERVED
   │
   ▼
   
3. SHIPPED (or HANDED_OFF)
   │
   │ Ship to team's address
   │ Inventory: Update status to IN_USE
   │
   ▼
   
4. IN_USE
   │
   │ Team is using the samples
   │ Inventory: Still marked as IN_USE
   │
   ▼
   
5. RETURNED
   │
   │ Team returns the samples
   │ Inventory: Update status back to AVAILABLE
   │
   ▼
   
6. CLOSED
   │
   │ Request is complete
   │ All timestamps recorded
   │
   └─ END
```

---

## 🗂️ Example: Data Tables with Sample Data

### ProductionItem Table
```
┌────────────────────┬─────────────────────────────┬─────────────┐
│ id                 │ name                        │ description │
├────────────────────┼─────────────────────────────┼─────────────┤
│ prod_001           │ Denim Jacket X             │ Classic...  │
│ prod_002           │ Summer Dress Y              │ Flowy...    │
│ prod_003           │ Leather Boots Z             │ Premium...  │
└────────────────────┴─────────────────────────────┴─────────────┘
```

### SampleItem Table
```
┌──────────────┬──────────────────┬─────────────┬──────────┬─────────┬──────────┐
│ id           │ productionItemId│ stage       │ color    │ size    │ revision │
├──────────────┼──────────────────┼─────────────┼──────────┼─────────┼──────────┤
│ sample_001   │ prod_001         │ PRODUCTION  │ BLACK    │ L       │ A        │
│ sample_002   │ prod_001         │ PRODUCTION  │ NAVY     │ M       │ B        │
│ sample_003   │ prod_001         │ PROTOTYPE   │ BLACK    │ XL      │ A        │
│ sample_004   │ prod_002         │ DEVELOPMENT │ ROSE     │ ONE_SIZE│ A        │
└──────────────┴──────────────────┴─────────────┴──────────┴─────────┴──────────┘
```

### SampleInventory Table
```
┌──────────────┬──────────────┬──────────┬──────────────┬─────────────┬────────────┐
│ id           │ sampleItemId │ quantity │ location     │ status      │ notes      │
├──────────────┼──────────────┼──────────┼──────────────┼─────────────┼────────────┤
│ inv_001      │ sample_001   │ 10       │ WAREHOUSE_A  │ AVAILABLE   │            │
│ inv_002      │ sample_001   │ 3        │ STUDIO_A     │ IN_USE      │ Photo shoot│
│ inv_003      │ sample_002   │ 15       │ WAREHOUSE_B  │ AVAILABLE   │            │
│ inv_004      │ sample_003   │ 2        │ STUDIO_B     │ RESERVED    │ For review │
└──────────────┴──────────────┴──────────┴──────────────┴─────────────┴────────────┘
```

### Team Table
```
┌──────────────┬──────────────────┬─────────────────┬──────────────┬────────────┐
│ id           │ name             │ contactEmail    │ isInternal   │ shipping   │
├──────────────┼──────────────────┼─────────────────┼──────────────┼────────────┤
│ team_001     │ Design Team      │ design@co.com  │ true         │ 123 Main St│
│ team_002     │ Marketing Team   │ marketing@co.com│ true         │ 456 Oak Ave│
│ team_003     │ Client ABC       │ client@abc.com │ false        │ 789 Elm St │
└──────────────┴──────────────────┴─────────────────┴──────────────┴────────────┘
```

### SampleRequest Table
```
┌──────────────┬──────────────┬──────────┬──────────┬─────────────┬──────────────┐
│ id           │ sampleItemId │ teamId   │ quantity │ status      │ requestedAt │
├──────────────┼──────────────┼──────────┼──────────┼─────────────┼──────────────┤
│ req_001      │ sample_001   │ team_001 │ 2        │ SHIPPED     │ 2024-01-15  │
│ req_002      │ sample_002   │ team_002 │ 1        │ IN_USE      │ 2024-01-20  │
│ req_003      │ sample_001   │ team_003 │ 3        │ REQUESTED   │ 2024-01-25  │
└──────────────┴──────────────┴──────────┴──────────┴─────────────┴──────────────┘
```

---

## 🔄 Example: Complete Request Journey

```
Day 1: REQUESTED
─────────────────────────────────────────
Team: "Design Team"
Requests: 2 units of "Denim Jacket X - PRODUCTION, BLACK, L"
Status: REQUESTED
Inventory: 10 units AVAILABLE in WAREHOUSE_A
         ↓
Day 2: APPROVED
─────────────────────────────────────────
Admin approves request
Status: APPROVED
Inventory: 2 units → RESERVED, 8 units still AVAILABLE
         ↓
Day 3: SHIPPED
─────────────────────────────────────────
Samples shipped to team
Status: SHIPPED
shippedAt: 2024-01-17
Inventory: 2 units → IN_USE
         ↓
Day 10: IN_USE
─────────────────────────────────────────
Team using samples for photoshoot
Status: IN_USE
handedOffAt: 2024-01-18
         ↓
Day 20: RETURNED
─────────────────────────────────────────
Team returns samples
Status: RETURNED
returnedAt: 2024-01-27
Inventory: 2 units → AVAILABLE (back in stock)
         ↓
Day 21: CLOSED
─────────────────────────────────────────
Request completed
Status: CLOSED
closedAt: 2024-01-28
```

---

## 🎨 Example: Color & Size Variations

```
ProductionItem: "Denim Jacket X"
│
├─ Stage: PRODUCTION
│  │
│  ├─ Color: BLACK
│  │  ├─ Size: S → SampleItem #1
│  │  ├─ Size: M → SampleItem #2
│  │  ├─ Size: L → SampleItem #3
│  │  └─ Size: XL → SampleItem #4
│  │
│  ├─ Color: NAVY
│  │  ├─ Size: S → SampleItem #5
│  │  ├─ Size: M → SampleItem #6
│  │  └─ Size: L → SampleItem #7
│  │
│  └─ Color: GRAY
│     └─ Size: ONE_SIZE → SampleItem #8
│
└─ Stage: PROTOTYPE
   └─ Color: BLACK
      └─ Size: M → SampleItem #9
```

---

## 📍 Example: Inventory Locations

```
SampleItem: "Denim Jacket X - PRODUCTION, BLACK, L"
│
├─ Location: WAREHOUSE_A
│  ├─ 10 units → Status: AVAILABLE
│  └─ 2 units → Status: RESERVED (for pending request)
│
├─ Location: STUDIO_A
│  └─ 3 units → Status: IN_USE (photo shoot)
│
└─ Location: SHOWROOM
   └─ 1 unit → Status: AVAILABLE (display)
```

---

## 💬 Example: Comment Threading

```
ProductionItem: "Denim Jacket X"
│
└─ Comment #1 (Root)
   ├─ Author: "John"
   ├─ Content: "This looks great!"
   ├─ Created: 2024-01-15
   │
   └─ Comment #2 (Reply to #1)
      ├─ Author: "Sarah"
      ├─ Content: "Agreed! The fit is perfect."
      └─ Created: 2024-01-16
      │
      └─ Comment #3 (Reply to #2)
         ├─ Author: "John"
         ├─ Content: "Let's order more samples"
         └─ Created: 2024-01-17
```

---

## 🔍 Example: Filtering & Search

### Inventory Page Filters
```
Filter by:
├─ Stage: [PROTOTYPE] [DEVELOPMENT] [PRODUCTION] [ARCHIVED]
├─ Color: [BLACK] [WHITE] [NAVY] [GRAY] ... (all colors)
└─ Size: [XS] [S] [M] [L] [XL] ... (all sizes)

Example Query:
"Show me all PRODUCTION stage items in BLACK color, size L"
→ Returns: SampleItem #1, SampleItem #3
```

### Requests Page Filters
```
Filter by:
├─ Status: [REQUESTED] [APPROVED] [SHIPPED] [IN_USE] [RETURNED] [CLOSED]
├─ Team: [Design Team] [Marketing Team] [Client ABC]
├─ Product Name: "Denim Jacket"
├─ Date From: 2024-01-01
└─ Date To: 2024-01-31

Example Query:
"Show me all SHIPPED requests from Design Team in January"
→ Returns: Request #1, Request #5
```

---

## 📊 Example: Status Transitions

### Request Status Flow
```
REQUESTED ──→ APPROVED ──→ SHIPPED ──→ IN_USE ──→ RETURNED ──→ CLOSED
                │              │
                │              └──→ HANDED_OFF ──→ IN_USE ──→ RETURNED ──→ CLOSED
                │
                └──→ (Can be rejected/cancelled)
```

### Inventory Status Flow
```
AVAILABLE ──→ RESERVED ──→ IN_USE ──→ AVAILABLE
    │             │
    │             └──→ (If request cancelled)
    │
    └──→ DAMAGED ──→ ARCHIVED
```

---

## 🎯 Key Takeaways

1. **ProductionItem** = Product concept (e.g., "Denim Jacket X")
2. **SampleItem** = Specific variation (Stage + Color + Size + Revision)
3. **SampleInventory** = Physical stock tracking (Quantity + Location + Status)
4. **Team** = Who requests samples (Internal or External)
5. **SampleRequest** = Request lifecycle (REQUESTED → CLOSED)
6. **Comment** = Notes on any entity (Product, Sample, or Request)
7. **AuditEvent** = History of all changes

### Important Rules:
- ✅ One ProductionItem can have many SampleItems
- ✅ One SampleItem can have many Inventory records (different locations)
- ✅ One SampleItem can have many Requests
- ✅ One Team can make many Requests
- ✅ Unique constraint: (productionItemId, stage, color, size, revision)
- ✅ Cannot delete SampleItem if it has Requests (Restrict)
- ✅ Deleting ProductionItem deletes all SampleItems (Cascade)
