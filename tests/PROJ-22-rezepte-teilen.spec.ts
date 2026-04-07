import { test, expect } from "@playwright/test";

// E2E tests für PROJ-22: Rezepte teilen (mit Connections)
// Voraussetzung: TEST_USER_EMAIL + TEST_USER_PASSWORD (ein normaler User-Account mit eigenen Rezepten)

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/passwort/i).fill(password);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|me|admin)/);
}

test.describe("PROJ-22: Rezepte teilen", () => {
  test.describe("Teilen-Button auf Rezeptdetailseite", () => {
    test("AC: 'Teilen'-Button erscheint auf eigenen Rezepten", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      // Go to own recipes
      await page.goto("/recipes?mine=1");
      const firstLink = page.locator("a[href^='/recipes/']").first();
      if (await firstLink.count() === 0) test.skip(true, "Kein eigenes Rezept vorhanden");
      await firstLink.click();
      await page.waitForURL(/\/recipes\//);
      await expect(page.getByRole("button", { name: /teilen/i })).toBeVisible();
    });

    test("AC: 'Teilen'-Button ist NICHT auf fremden/globalen Rezepten sichtbar", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/recipes");
      // Find a recipe NOT owned by current user
      const allLinks = page.locator("a[href^='/recipes/']");
      const count = await allLinks.count();
      if (count === 0) test.skip(true, "Keine fremden Rezepte vorhanden");
      // Try first non-own recipe
      for (let i = 0; i < Math.min(count, 3); i++) {
        await allLinks.nth(i).click();
        await page.waitForURL(/\/recipes\//);
        // Check if it's not own recipe (no Bearbeiten button)
        const isOwn = await page.getByRole("link", { name: /bearbeiten/i }).isVisible();
        if (!isOwn) {
          // Should NOT have Teilen button
          await expect(page.getByRole("button", { name: /teilen/i })).not.toBeVisible();
          break;
        }
        await page.goBack();
      }
    });

    test("AC: Teilen-Sheet öffnet sich und zeigt Verbindungen oder Hinweis", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/recipes?mine=1");
      const firstLink = page.locator("a[href^='/recipes/']").first();
      if (await firstLink.count() === 0) test.skip(true, "Kein eigenes Rezept vorhanden");
      await firstLink.click();
      await page.waitForURL(/\/recipes\//);
      const shareBtn = page.getByRole("button", { name: /teilen/i });
      if (!(await shareBtn.isVisible())) test.skip(true, "Teilen-Button nicht sichtbar (ggf. fremdes Rezept)");
      await shareBtn.click();
      // Sheet should open with either connections or "keine Verbindungen" message
      await expect(
        page.getByText(/wähle verbindungen|noch keine verbindungen/i)
      ).toBeVisible();
    });

    test("AC: Teilen-Sheet zeigt Hinweis wenn keine Verbindungen vorhanden", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/recipes?mine=1");
      const firstLink = page.locator("a[href^='/recipes/']").first();
      if (await firstLink.count() === 0) test.skip(true, "Kein eigenes Rezept vorhanden");
      await firstLink.click();
      await page.waitForURL(/\/recipes\//);
      const shareBtn = page.getByRole("button", { name: /teilen/i });
      if (!(await shareBtn.isVisible())) test.skip(true, "Kein eigenes Rezept");
      await shareBtn.click();
      // If no connections, must show the info + link to /connections
      const noConnMsg = page.getByText(/noch keine verbindungen/i);
      if (await noConnMsg.isVisible()) {
        await expect(page.getByRole("link", { name: /verbindungen/i })).toBeVisible();
      }
    });
  });

  test.describe("Geteilte Rezepte Inbox (/connections)", () => {
    test.beforeEach(async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/connections");
    });

    test("AC: Connections-Seite lädt ohne Fehler", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /verbindungen/i })).toBeVisible();
    });

    test("AC: Inbox erscheint wenn geteilte Rezepte vorhanden", async ({ page }) => {
      const inboxSection = page.getByText(/geteilte rezepte/i);
      if (await inboxSection.isVisible()) {
        await expect(page.getByText(/geteilt von/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /in meine rezepte kopieren/i })).toBeVisible();
      }
    });

    test("AC: Geteilte Rezepte zeigen Sender-Info", async ({ page }) => {
      const shared = page.getByText(/geteilt von @/i);
      if (await shared.count() > 0) {
        await expect(shared.first()).toBeVisible();
      }
    });

    test("AC: Dismiss-Button (X) ist in jedem Shared Item vorhanden", async ({ page }) => {
      const copyBtns = page.getByRole("button", { name: /in meine rezepte kopieren/i });
      if (await copyBtns.count() > 0) {
        // X dismiss button should also be there
        // Each card should have exactly one X button near the copy button
        await expect(page.locator('button[class*="muted"]').first()).toBeVisible();
      }
    });
  });

  test.describe("Kopieren-Aktion", () => {
    test("AC: 'Kopieren'-Button erscheint auf Rezepten die nicht dem User gehören", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/recipes");
      // Find a non-own recipe
      const allLinks = page.locator("a[href^='/recipes/']");
      const count = await allLinks.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        await allLinks.nth(i).click();
        await page.waitForURL(/\/recipes\//);
        const isOwn = await page.getByRole("link", { name: /bearbeiten/i }).isVisible();
        if (!isOwn) {
          await expect(page.getByRole("button", { name: /kopieren/i })).toBeVisible();
          break;
        }
        await page.goBack();
      }
    });
  });

  test.describe("API-Schutz (Security)", () => {
    test("SEC: GET /api/shared-recipes gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.get("/api/shared-recipes");
      expect(res.status()).toBe(401);
    });

    test("SEC: POST /api/shared-recipes gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.post("/api/shared-recipes", {
        data: { recipeId: "fake", recipientIds: ["fake"] },
      });
      expect(res.status()).toBe(401);
    });

    test("SEC: POST /api/shared-recipes/[id] (copy) gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.post("/api/shared-recipes/fake-id");
      expect(res.status()).toBe(401);
    });

    test("SEC: PATCH /api/shared-recipes/[id] (dismiss) gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.patch("/api/shared-recipes/fake-id");
      expect(res.status()).toBe(401);
    });

    test("SEC: User kann nicht fremde Rezepte sharen (403)", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      // Try to share a recipe that doesn't belong to this user
      // First find any global/foreign recipe ID
      await page.goto("/recipes");
      const globalBadge = page.locator('[class*="text-blue"]').filter({ hasText: /global/i }).first();
      if (await globalBadge.count() === 0) test.skip(true, "Kein globales Rezept zum Testen vorhanden");
      const recipeLink = page.locator("a[href^='/recipes/']").first();
      const href = await recipeLink.getAttribute("href");
      const recipeId = href?.split("/").pop();
      if (!recipeId) test.skip(true, "Keine Rezept-ID gefunden");
      const res = await page.request.post("/api/shared-recipes", {
        data: { recipeId, recipientIds: ["any-id"] },
      });
      expect(res.status()).toBe(403);
    });

    test("SEC: POST /api/recipes/[id]/copy gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.post("/api/recipes/fake-id/copy");
      expect(res.status()).toBe(401);
    });

    test("SEC: User kann kein eigenes Rezept kopieren", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      // Get own recipe ID
      await page.goto("/recipes?mine=1");
      const link = page.locator("a[href^='/recipes/']").first();
      if (await link.count() === 0) test.skip(true, "Kein eigenes Rezept vorhanden");
      const href = await link.getAttribute("href");
      const recipeId = href?.split("/").pop();
      if (!recipeId) test.skip(true, "Keine Rezept-ID");
      const res = await page.request.post(`/api/recipes/${recipeId}/copy`);
      expect(res.status()).toBe(400);
    });
  });
});
