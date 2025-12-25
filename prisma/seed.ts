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
        address: "123 Fashion Ave, New York, NY 10001",
        contactEmail: "marketing@company.com",
        contactPhone: "+1-555-0101",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "Runway",
        address: "456 Runway Blvd, New York, NY 10002",
        contactEmail: "runway@company.com",
        contactPhone: "+1-555-0102",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "E-commerce",
        address: "789 Digital St, New York, NY 10003",
        contactEmail: "ecommerce@company.com",
        contactPhone: "+1-555-0103",
        isInternal: true,
      },
    }),
    prisma.team.create({
      data: {
        name: "External Photographer - Studio X",
        address: "321 Photo Lane, Los Angeles, CA 90001",
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
    
    // Different color palettes for different items
    const colorPalettes: Record<string, string[]> = {
      "Denim Jacket X": ["Black", "Navy", "Light Blue", "White"],
      "Silk Blouse Premium": ["Black", "Ivory", "Rose", "Sage"],
      "Wool Coat Classic": ["Black", "Camel", "Charcoal", "Navy"],
      "Cotton T-Shirt Essential": ["White", "Black", "Gray", "Navy"],
    };
    
    const colors = colorPalettes[prodItem.name] || ["Black", "Navy", "White", "Beige"];
    const sizes = ["XS", "S", "M", "L", "XL"];

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

          // Create inventory entries with varied quantities
          const quantity = 
            stage === "PROTOTYPE" ? 1 : 
            stage === "DEVELOPMENT" ? 2 : 
            3;
          
          const location = 
            stage === "PROTOTYPE" ? "STUDIO_A" : 
            stage === "DEVELOPMENT" ? "WAREHOUSE_B" : 
            "WAREHOUSE_C";

          await prisma.sampleInventory.create({
            data: {
              sampleItemId: sampleItem.id,
              quantity,
              location,
              status: "AVAILABLE",
            },
          });
        }
      }
    }
  }

  console.log(`✅ Created ${sampleItems.length} sample items with inventory`);

  // Create some sample requests
  const requests = await Promise.all([
    prisma.sampleRequest.create({
      data: {
        sampleItemId: sampleItems[0].id,
        teamId: teams[0].id,
        quantity: 1,
        status: "APPROVED",
        shippingMethod: "Internal Hand-off",
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
        notes: "For product page photography",
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
        action: "QUANTITY_UPDATED",
        userId: "coordinator-1",
        metadata: { quantity: 1 },
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

