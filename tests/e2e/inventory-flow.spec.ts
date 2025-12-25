import { test, expect } from "@playwright/test";

test.describe("Inventory Flow", () => {
  test("should open inventory, view modal, and create request", async ({
    page,
  }) => {
    // Navigate to inventory page
    await page.goto("/inventory");

    // Wait for inventory cards to load
    await page.waitForSelector("text=Denim Jacket X", { timeout: 10000 });

    // Click on first inventory card
    const firstCard = page.locator("text=Denim Jacket X").first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Verify modal content
    await expect(page.locator("text=Sample details and management")).toBeVisible();

    // Click "Create Request" button
    await page.locator("button:has-text('Create Request')").click();

    // Wait for create request dialog
    await page.waitForSelector("text=Create Sample Request", { timeout: 5000 });

    // Fill in request form
    await page.locator("button:has-text('Select a team')").click();
    await page.locator("text=Marketing").first().click();

    await page.locator('input[type="number"]').fill("1");

    // Submit form
    await page.locator("button:has-text('Create Request')").click();

    // Wait for success (modal should close or show success message)
    await page.waitForTimeout(1000);

    // Verify request was created by checking requests page
    await page.goto("/requests");
    await expect(page.locator("text=Denim Jacket X")).toBeVisible({ timeout: 5000 });
  });
});

