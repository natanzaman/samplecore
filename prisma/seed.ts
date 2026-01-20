import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (for development)
  await prisma.auditEvent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.sampleRequest.deleteMany();
  await prisma.sampleInventory.deleteMany();
  await prisma.sampleItem.deleteMany();
  await prisma.team.deleteMany();
  await prisma.productionItem.deleteMany();

  // Create Teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Marketing",
        shippingAddress: "123 Fashion Ave, New York, NY 10001",
        contactEmail: "marketing@company.com",
        contactPhone: "+1-555-0101",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "Runway",
        shippingAddress: "456 Runway Blvd, New York, NY 10002",
        contactEmail: "runway@company.com",
        contactPhone: "+1-555-0102",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "E-commerce",
        shippingAddress: "789 Digital St, New York, NY 10003",
        contactEmail: "ecommerce@company.com",
        contactPhone: "+1-555-0103",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "External Photographer - Studio X",
        shippingAddress: "321 Photo Lane, Los Angeles, CA 90001",
        contactEmail: "contact@studiox.com",
        contactPhone: "+1-555-0201",
        isInternal: false,
      },
    }),
  ]);

  console.log(`✅ Created ${teams.length} teams`);

  // Create Production Items
  const productionItems = await Promise.all([
    prisma.productionItem.create({
      data: {
        name: "Denim Jacket X",
        description: "Classic denim jacket with modern fit",
      },
    }),
    prisma.productionItem.create({
      data: {
        name: "Silk Blouse Premium",
        description: "Luxury silk blouse with intricate detailing",
      },
    }),
    prisma.productionItem.create({
      data: {
        name: "Wool Coat Classic",
        description: "Timeless wool coat for winter collection",
      },
    }),
    prisma.productionItem.create({
      data: {
        name: "Cotton T-Shirt Essential",
        description: "Basic cotton tee with premium feel",
      },
    }),
  ]);

  console.log(`✅ Created ${productionItems.length} production items`);

  // Create Sample Items with variations
  const sampleItems = [];

  for (const prodItem of productionItems) {
    // Create multiple stages/colors/sizes for each production item
    const stages: Array<"PROTOTYPE" | "DEVELOPMENT" | "PRODUCTION"> = [
      "PROTOTYPE",
      "DEVELOPMENT",
      "PRODUCTION",
    ];
    
    // Different color palettes for different items (using enum values)
    const colorPalettes: Record<string, string[]> = {
      "Denim Jacket X": ["BLACK", "NAVY", "LIGHT_BLUE", "WHITE"],
      "Silk Blouse Premium": ["BLACK", "IVORY", "ROSE", "SAGE"],
      "Wool Coat Classic": ["BLACK", "CAMEL", "CHARCOAL", "NAVY"],
      "Cotton T-Shirt Essential": ["WHITE", "BLACK", "GRAY", "NAVY"],
    };
    
    const colors = colorPalettes[prodItem.name] || ["BLACK", "NAVY", "WHITE", "BEIGE"];
    const sizes = ["XS", "S", "M", "L", "XL"] as const;

    // Create all stages with all colors and sizes
    for (const stage of stages) {
      for (const color of colors) {
        for (const size of sizes) {
          // Different revisions based on stage
          const revision = stage === "PROTOTYPE" ? "A" : stage === "DEVELOPMENT" ? "B" : "C";
          
          const sampleItem = await prisma.sampleItem.create({
            data: {
              productionItemId: prodItem.id,
              stage,
              color,
              size,
              revision,
              notes:
                stage === "PROTOTYPE"
                  ? "Initial prototype sample"
                  : stage === "DEVELOPMENT"
                  ? "Revised sample with adjustments"
                  : "Production-ready sample",
            },
          });
          sampleItems.push(sampleItem);

          // Create individual inventory records (one per item)
          const itemCount = 
            stage === "PROTOTYPE" ? 1 : 
            stage === "DEVELOPMENT" ? 2 : 
            3;
          
          // Vary locations and statuses for more realistic data
          const locations = ["STUDIO_A", "STUDIO_B", "WAREHOUSE_A", "WAREHOUSE_B", "WAREHOUSE_C", "SHOWROOM", "PHOTO_STUDIO"] as const;
          const statuses: Array<"AVAILABLE" | "IN_USE" | "RESERVED" | "DAMAGED"> = ["AVAILABLE", "IN_USE", "RESERVED"];
          
          // Create individual inventory records
          const inventoryRecords = [];
          for (let i = 0; i < itemCount; i++) {
            const location = locations[i % locations.length];
            const status = i === 0 ? "AVAILABLE" : statuses[i % statuses.length];
            
            inventoryRecords.push({
              sampleItemId: sampleItem.id,
              location,
              status,
              notes: i === 0 && stage === "PRODUCTION" ? "Primary stock item" : null,
            });
          }
          
          await prisma.sampleInventory.createMany({
            data: inventoryRecords,
          });
        }
      }
    }
  }

  console.log(`✅ Created ${sampleItems.length} sample items with inventory`);

  // Create some sample requests with varied statuses
  const requests = await Promise.all([
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[0].id,
        teamId: teams[0].id,
        quantity: 1,
        status: "APPROVED",
        shippingMethod: "Internal Hand-off",
        shippingAddress: "123 Fashion Ave, New York, NY 10001",
        notes: "Needed for photoshoot next week",
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[2].id,
        teamId: teams[1].id,
        quantity: 2,
        status: "IN_USE",
        shippingMethod: "Internal Hand-off",
        shippingAddress: "456 Runway Blvd, New York, NY 10002",
        notes: "For runway show preparation",
        requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        handedOffAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[4].id,
        teamId: teams[3].id,
        quantity: 1,
        status: "SHIPPED",
        shippingMethod: "FedEx Overnight",
        shippingAddress: "321 Photo Lane, Los Angeles, CA 90001",
        notes: "External photographer for campaign",
        requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[6].id,
        teamId: teams[2].id,
        quantity: 1,
        status: "REQUESTED",
        shippingMethod: "Internal Hand-off",
        shippingAddress: "789 Digital St, New York, NY 10003",
        notes: "For product page photography",
      },
    }),
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[10].id,
        teamId: teams[0].id,
        quantity: 1,
        status: "RETURNED",
        shippingMethod: "Internal Hand-off",
        notes: "Returned after photoshoot",
        requestedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[15].id,
        teamId: teams[1].id,
        quantity: 1,
        status: "CLOSED",
        shippingMethod: "Internal Hand-off",
        notes: "Completed request",
        requestedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${requests.length} sample requests`);

  // Create some comments
  await Promise.all([
    prisma.comment.create({
      data: {
        sampleItemId: sampleItems[0].id,
        content: "Fit looks great, ready for production",
        authorId: "coordinator-1",
      },
    }),
    prisma.comment.create({
      data: {
        sampleItemId: sampleItems[0].id,
        content: "Color matching approved",
        authorId: "coordinator-1",
      },
    }),
    prisma.comment.create({
      data: {
        requestId: requests[0].id,
        content: "Delivered to marketing team",
        authorId: "coordinator-1",
      },
    }),
  ]);

  console.log("✅ Created comments");

  // Create audit events
  const auditEvents = await Promise.all([
    prisma.auditEvent.create({
      data: {
        entityType: "SampleRequest",
        entityId: requests[0].id,
        action: "CREATED",
        userId: "coordinator-1",
        metadata: { status: "REQUESTED" },
      },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: "SampleRequest",
        entityId: requests[0].id,
        action: "STATUS_CHANGED",
        userId: "coordinator-1",
        metadata: { from: "REQUESTED", to: "APPROVED" },
      },
    }),
    prisma.auditEvent.create({
      data: {
        entityType: "SampleInventory",
        entityId: sampleItems[0].id,
        action: "CREATED",
        userId: "coordinator-1",
        metadata: { location: "STUDIO_A", status: "AVAILABLE" },
      },
    }),
  ]);

  console.log(`✅ Created ${auditEvents.length} audit events`);

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

