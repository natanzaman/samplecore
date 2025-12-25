import { Prisma } from "@prisma/client";
import { db } from "./db";

/**
 * Handle Prisma unique constraint errors and return user-friendly messages
 * with existing record values
 */
export async function handleUniqueConstraintError(
  error: unknown,
  entityType: "SampleItem" | "ProductionItem" | "Team",
  searchFields: Record<string, any>
): Promise<string> {
  // Check if it's a Prisma unique constraint error
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target as string[] | undefined;
    
    if (!target) {
      return "A record with these values already exists.";
    }

    // Fetch the existing record to show its values
    try {
      let existingRecord: any = null;

      if (entityType === "SampleItem") {
        existingRecord = await db.sampleItem.findFirst({
          where: {
            productionItemId: searchFields.productionItemId,
            stage: searchFields.stage,
            color: searchFields.color || null,
            size: searchFields.size || null,
            revision: searchFields.revision,
          },
          include: {
            productionItem: true,
          },
        });

        if (existingRecord) {
          const fields = [
            `Product: ${existingRecord.productionItem.name}`,
            `Stage: ${existingRecord.stage}`,
            existingRecord.color ? `Color: ${existingRecord.color}` : null,
            existingRecord.size ? `Size: ${existingRecord.size}` : null,
            `Revision: ${existingRecord.revision}`,
          ].filter(Boolean);

          return `A sample item with these values already exists: ${fields.join(", ")}`;
        }
      } else if (entityType === "ProductionItem") {
        // ProductionItem doesn't have a unique constraint on name in the schema,
        // but handle it in case one is added or for other unique constraints
        if (searchFields.name) {
          existingRecord = await db.productionItem.findFirst({
            where: {
              name: searchFields.name,
            },
          });

          if (existingRecord) {
            return `A production item with the name "${existingRecord.name}" already exists.`;
          }
        }
      } else if (entityType === "Team") {
        // Team doesn't have a unique constraint on name in the schema,
        // but handle it in case one is added or for other unique constraints
        if (searchFields.name) {
          existingRecord = await db.team.findFirst({
            where: {
              name: searchFields.name,
            },
          });

          if (existingRecord) {
            return `A team with the name "${existingRecord.name}" already exists.`;
          }
        }
      }
    } catch (fetchError) {
      // If we can't fetch the existing record, return a generic message
      console.error("Error fetching existing record:", fetchError);
    }

    return "A record with these values already exists.";
  }

  // If it's not a Prisma error or not a unique constraint error, re-throw
  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Unknown error occurred");
}

