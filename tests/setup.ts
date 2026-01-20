import { afterAll } from "vitest";
import { db } from "../src/lib/db";

// Disconnect from database after all tests complete
afterAll(async () => {
  await db.$disconnect();
});

