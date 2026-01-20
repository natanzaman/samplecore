# Migration: Remove Quantity from SampleInventory

## Summary
Changed SampleInventory from quantity-based tracking to individual item tracking. Each inventory record now represents one physical item instead of a quantity.

## Changes Made

### 1. Database Schema
- ✅ Removed `quantity` field from `SampleInventory` model
- Each record = one physical item

### 2. Services Updated
- ✅ `InventoryService.createSampleItemsWithInventory()` - Now creates multiple records using `createMany()`
- ✅ `InventoryService.createInventory()` - Updated audit metadata
- ✅ `InventoryService.addInventory()` - Alias updated

### 3. Validation Schemas
- ✅ Removed `quantity` from `CreateInventorySchema`
- ✅ Updated `UpdateInventorySchema`

### 4. UI Components Updated
- ✅ `add-inventory-dialog.tsx` - Now asks for "Number of Items" and creates that many records
- ✅ `sample-detail-content.tsx` - Changed from summing quantity to counting records
- ✅ `inventory-card.tsx` - Changed from summing quantity to counting records
- ✅ All "Available Quantity" labels changed to "Available Items"

### 5. Actions Updated
- ✅ `actions/inventory.ts` - Removed quantity parameter

## Database Migration Required

You need to run a migration to:
1. Remove the `quantity` column from `sample_inventory` table
2. Convert existing quantity-based records to individual records

### Migration Steps

1. **Create migration file:**
```bash
npx prisma migrate dev --name remove_quantity_from_sample_inventory
```

2. **Manual data migration (if you have existing data):**
You'll need to write a script to convert existing records:
- For each inventory record with quantity > 1, create that many individual records
- Delete the original record with quantity > 1
- Keep records with quantity = 1 as-is

Example migration script:
```typescript
// This should be run BEFORE the schema migration
async function migrateInventoryData() {
  const inventories = await db.sampleInventory.findMany({
    where: {
      quantity: { gt: 1 }
    }
  });

  for (const inv of inventories) {
    // Create individual records
    await db.sampleInventory.createMany({
      data: Array.from({ length: inv.quantity }, () => ({
        sampleItemId: inv.sampleItemId,
        location: inv.location,
        status: inv.status,
        notes: inv.notes,
      }))
    });
    
    // Delete the original record
    await db.sampleInventory.delete({
      where: { id: inv.id }
    });
  }
}
```

3. **After migration, update seed data:**
The seed file also needs to be updated to create individual records instead of quantity-based ones.

## Benefits

✅ **Individual Tracking**: Each physical item can be tracked separately
✅ **Better Auditing**: Know exactly which item went where
✅ **Future Extensibility**: Can add serial numbers, individual notes, etc.
✅ **Simpler Logic**: No quantity math needed - just count records

## Notes

- `SampleRequest.quantity` remains unchanged (requests can still be for multiple items)
- The UI now shows "Available Items" instead of "Available Quantity"
- When adding inventory, users specify how many items to add, and the system creates that many individual records
