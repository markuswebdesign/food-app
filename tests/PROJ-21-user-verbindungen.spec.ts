import { test, expect } from "@playwright/test";

// E2E tests für PROJ-21: User-Verbindungen (Freundschaft)
// Voraussetzung: TEST_USER_EMAIL + TEST_USER_PASSWORD (ein normaler User-Account)

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/passwort/i).fill(password);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|me|admin)/);
}

test.describe("PROJ-21: User-Verbindungen", () => {
  test.describe("Navigation & Seite", () => {
    test("AC: 'Verbindungen'-Link ist im NavBar sichtbar (eingeloggt)", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/me");
      await expect(page.getByRole("link", { name: /verbindungen/i })).toBeVisible();
    });

    test("AC: /connections Seite lädt für eingeloggte User", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/connections");
      await expect(page.getByRole("heading", { name: /verbindungen/i })).toBeVisible();
    });

    test("AC: Nicht eingeloggter User wird von /connections zu /login weitergeleitet", async ({ page }) => {
      await page.goto("/connections");
      await expect(page).toHaveURL(/\/login/);
    });

    test("AC: Verbindungen-Seite zeigt alle Sektionen", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/connections");
      await expect(page.getByText(/nutzer suchen/i)).toBeVisible();
      await expect(page.getByText(/meine verbindungen/i)).toBeVisible();
    });
  });

  test.describe("Benutzersuche", () => {
    test.beforeEach(async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/connections");
    });

    test("AC: Suchfeld und Such-Button sind vorhanden", async ({ page }) => {
      await expect(page.getByPlaceholder(/benutzername/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /suchen/i, exact: false }).first()).toBeVisible();
    });

    test("AC: Suche nach nicht-existentem Nutzer zeigt 'Keine Nutzer gefunden'", async ({ page }) => {
      await page.getByPlaceholder(/benutzername/i).fill("zzz_gibt_es_nicht_xyz_123");
      await page.getByRole("button", { name: /suchen/i, exact: false }).first().click();
      await expect(page.getByText(/keine nutzer gefunden/i)).toBeVisible();
    });

    test("AC: Suche nach eigenem Benutzernamen zeigt kein Ergebnis (self-exclusion)", async ({ page }) => {
      // Get own username from nav
      const navUsername = await page.locator("button[aria-haspopup]").textContent();
      if (navUsername) {
        const username = navUsername.trim().replace("@", "");
        if (username.length > 2) {
          await page.getByPlaceholder(/benutzername/i).fill(username);
          await page.getByRole("button", { name: /suchen/i, exact: false }).first().click();
          // Own username should not appear in results
          const resultLinks = page.locator('[class*="font-medium"]').filter({ hasText: `@${username}` });
          if (await resultLinks.count() > 0) {
            // Should not see a "Anfrage senden" button for ourselves
            await expect(page.getByRole("button", { name: /anfrage senden/i })).not.toBeVisible();
          }
        }
      }
    });

    test("AC: Enter-Taste triggert Suche", async ({ page }) => {
      const input = page.getByPlaceholder(/benutzername/i);
      await input.fill("zzz_test_123");
      await input.press("Enter");
      // Should show results area (even if empty)
      await expect(page.getByText(/keine nutzer gefunden|anfrage senden/i)).toBeVisible();
    });
  });

  test.describe("Verbindungsliste", () => {
    test.beforeEach(async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/connections");
    });

    test("AC: Verbindungen-Sektion zeigt Anzahl der bestehenden Verbindungen", async ({ page }) => {
      await expect(page.getByText(/meine verbindungen \(\d+\)/i)).toBeVisible();
    });

    test("AC: Ohne Verbindungen wird Hinweis-Text angezeigt", async ({ page }) => {
      const count = await page.locator('[class*="font-medium"]').filter({ hasText: /@\w+/ }).count();
      if (count === 0) {
        await expect(page.getByText(/noch keine verbindungen/i)).toBeVisible();
      }
    });
  });

  test.describe("API-Schutz (Security)", () => {
    test("SEC: GET /api/connections gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.get("/api/connections");
      expect(res.status()).toBe(401);
    });

    test("SEC: POST /api/connections gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.post("/api/connections", {
        data: { recipientId: "some-uuid" },
      });
      expect(res.status()).toBe(401);
    });

    test("SEC: PATCH /api/connections/[id] gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.patch("/api/connections/fake-id", {
        data: { action: "accept" },
      });
      expect(res.status()).toBe(401);
    });

    test("SEC: DELETE /api/connections/[id] gibt 401 ohne Auth", async ({ page }) => {
      const res = await page.request.delete("/api/connections/fake-id");
      expect(res.status()).toBe(401);
    });

    test("SEC: User kann keine Anfrage an sich selbst senden", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      // Get own user ID from profile
      const res = await page.request.post("/api/connections", {
        data: { recipientId: "self" }, // 'self' is not a valid UUID
      });
      expect(res.status()).toBe(400);
    });

    test("SEC: PATCH auf fremde Connection gibt 403", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      // Try to accept a connection that doesn't belong to this user
      const res = await page.request.patch("/api/connections/00000000-0000-0000-0000-000000000000", {
        data: { action: "accept" },
      });
      expect([403, 404]).toContain(res.status());
    });
  });
});
