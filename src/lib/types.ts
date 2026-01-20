/**
 * Centralized type definitions for Prisma payloads
 * This prevents duplicate type definitions across components
 */

import type { Prisma } from "@prisma/client";

// ============================================
// Sample Item Types
// ============================================

export type SampleItemWithRelations = Prisma.SampleItemGetPayload<{
  include: {
    productionItem: true;
    inventory: true;
    comments: true;
    requests: {
      include: {
        team: true;
      };
    };
  };
}>;

export type SampleItemWithInventory = Prisma.SampleItemGetPayload<{
  include: {
    productionItem: true;
    inventory: true;
  };
}>;

export type SampleItemBasic = Prisma.SampleItemGetPayload<{
  include: {
    inventory: true;
    _count: {
      select: {
        requests: true;
        comments: true;
      };
    };
  };
}>;

// ============================================
// Production Item Types
// ============================================

export type ProductionItemWithSamples = Prisma.ProductionItemGetPayload<{
  include: {
    comments: true;
    sampleItems: {
      include: {
        inventory: true;
        requests: {
          include: {
            team: true;
          };
        };
        _count: {
          select: {
            requests: true;
            comments: true;
          };
        };
      };
    };
  };
}>;

export type ProductionItemWithLatestSample = Prisma.ProductionItemGetPayload<{
  include: {
    sampleItems: {
      include: {
        inventory: true;
      };
    };
  };
}>;

// ============================================
// Request Types
// ============================================

export type RequestWithRelations = Prisma.SampleRequestGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
        inventory: true;
      };
    };
    team: true;
    comments: true;
  };
}>;

export type RequestWithSampleAndTeam = Prisma.SampleRequestGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
      };
    };
    team: true;
  };
}>;

// ============================================
// Team Types
// ============================================

export type TeamWithRequests = Prisma.TeamGetPayload<{
  include: {
    requests: {
      include: {
        sampleItem: {
          include: {
            productionItem: true;
          };
        };
      };
    };
    _count: {
      select: {
        requests: true;
      };
    };
  };
}>;

export type TeamWithCount = Prisma.TeamGetPayload<{
  include: {
    _count: {
      select: {
        requests: true;
      };
    };
  };
}>;

// ============================================
// Comment Types
// ============================================

export type CommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    replies: {
      include: {
        replies: {
          include: {
            replies: true;
          };
        };
      };
    };
  };
}>;

// ============================================
// Inventory Types
// ============================================

export type InventoryWithSample = Prisma.SampleInventoryGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
      };
    };
  };
}>;
