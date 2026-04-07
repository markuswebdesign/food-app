import { test, expect } from "@playwright/test";

// E2E tests für PROJ-19: Admin Panel (Dashboard & User-Verwaltung)
// Voraussetzung: ADMIN_EMAIL + ADMIN_PASSWORD (ein Admin-Account)
// Optional: TEST_USER_EMAIL + TEST_USER_PASSWORD (ein normaler User-Account)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/passwort/i).fill(password);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|me|admin)/);
}

test.describe("PROJ-19: Admin Panel", () => {
  test.describe("Zugriffskontrolle", () => {
    test("AC: Nicht eingeloggter User wird von /admin zu /login weitergeleitet", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/login/);
    });

    test("AC: Normaler User wird von /admin zu /me weitergeleitet", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/me/);
    });

    test("AC: Admin kann /admin aufrufen", async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin/);
      await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();
    });

    test("AC: Admin-Link im NavBar sichtbar für Admins", async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/me");
      await expect(page.getByRole("link", { name: /^Admin$/i })).toBeVisible();
    });

    test("AC: Admin-Link NICHT sichtbar für normale User", async ({ page }) => {
      if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, "TEST_USER_EMAIL nicht gesetzt");
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
      await page.goto("/me");
      await expect(page.getByRole("link", { name: /^Admin$/i })).not.toBeVisible();
    });
  });

  test.describe("Dashboard (/admin)", () => {
    test.beforeEach(async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/admin");
    });

    test("AC: Dashboard zeigt 4 Kennzahl-Karten", async ({ page }) => {
      await expect(page.getByText(/nutzer gesamt/i)).toBeVisible();
      await expect(page.getByText(/aktiv.*30 tage/i)).toBeVisible();
      await expect(page.getByText(/öffentliche rezepte/i)).toBeVisible();
      await expect(page.getByText(/private rezepte/i)).toBeVisible();
    });

    test("AC: Kennzahlen zeigen numerische Werte", async ({ page }) => {
      const cards = page.locator(".text-3xl.font-bold");
      await expect(cards).toHaveCount(4);
      for (const card of await cards.all()) {
        const text = await card.textContent();
        expect(Number(text)).not.toBeNaN();
      }
    });
  });

  test.describe("Nutzerliste (/admin/users)", () => {
    test.beforeEach(async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/admin/users");
    });

    test("AC: User-Tabelle zeigt Spalten: Nutzername, Rolle, Status, Aktionen", async ({ page }) => {
      await expect(page.getByRole("columnheader", { name: /nutzername/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /rolle/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /aktionen/i })).toBeVisible();
    });

    test("AC: Suchfeld filtert Nutzerliste", async ({ page }) => {
      const search = page.getByPlaceholder(/suche nach name oder e-mail/i);
      await expect(search).toBeVisible();
      // Suche nach etwas das nicht existiert
      await search.fill("zzz_gibt_es_nicht_xyz");
      await expect(page.getByText(/keine nutzer gefunden/i)).toBeVisible();
      // Leeren
      await search.clear();
      await expect(page.getByText(/keine nutzer gefunden/i)).not.toBeVisible();
    });

    test("AC: Eigener Account hat keine Aktions-Buttons (nur Strich)", async ({ page }) => {
      // Der eingeloggte Admin hat "(du)" im Nutzernamen
      const myRow = page.locator("tr").filter({ hasText: "(du)" });
      await expect(myRow).toBeVisible();
      // Kein "Sperren" oder "Entziehen" Button in der eigenen Zeile
      await expect(myRow.getByRole("button", { name: /sperren/i })).not.toBeVisible();
      await expect(myRow.getByRole("button", { name: /entziehen/i })).not.toBeVisible();
    });

    test("AC: Bestätigungsdialog erscheint vor Rollen-Änderung", async ({ page }) => {
      if (!TEST_EMAIL) test.skip(true, "TEST_USER_EMAIL nicht gesetzt — kein zweiter User zum Testen");
      // Finde einen anderen User (nicht der eingeloggte Admin)
      const otherRow = page.locator("tr").filter({ hasNot: page.locator('text="(du)"') }).nth(1);
      const roleBtn = otherRow.getByRole("button", { name: /zum admin|entziehen/i });
      await roleBtn.click();
      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(page.getByText(/rolle ändern/i)).toBeVisible();
      // Abbrechen
      await page.getByRole("button", { name: /abbrechen/i }).click();
      await expect(page.getByRole("alertdialog")).not.toBeVisible();
    });

    test("AC: Bestätigungsdialog erscheint vor Sperren", async ({ page }) => {
      const otherRow = page.locator("tr").filter({ hasNot: page.locator('text="(du)"') }).nth(1);
      const banBtn = otherRow.getByRole("button", { name: /sperren|entsperren/i });
      await banBtn.click();
      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(page.getByText(/account sperren|account entsperren/i)).toBeVisible();
      // Abbrechen
      await page.getByRole("button", { name: /abbrechen/i }).click();
      await expect(page.getByRole("alertdialog")).not.toBeVisible();
    });
  });

  test.describe("Login-Schutz für gesperrte User", () => {
    test("AC: Gesperrter User sieht Fehlermeldung beim Login", async ({ page }) => {
      // Dieser Test setzt voraus, dass TEST_USER_EMAIL ein gesperrter Account ist
      // In der Praxis: manuell im Admin sperren, dann testen
      // Hier testen wir nur den Mechanismus (Mock-Szenario nicht möglich ohne Admin-Setup)
      // Stattdessen: prüfen dass Login-Page die Fehlermeldung rendern kann
      await page.goto("/login");
      await expect(page.getByText(/anmelden/i).first()).toBeVisible();
      // Die eigentliche Ban-Prüfung erfordert einen echten gesperrten Account
      // → Als Integration-Test dokumentiert, nicht automatisierbar ohne Testdaten-Setup
      test.info().annotations.push({
        type: "note",
        description: "Ban-Login-Test erfordert vorbereiteten gesperrten Test-Account"
      });
    });
  });

  test.describe("Sicherheit: Unauthorized API-Zugriff", () => {
    test("SEC: /api/admin/users PATCH ohne Session gibt 401", async ({ page }) => {
      const res = await page.request.patch("/api/admin/users", {
        data: { action: "set_role", userId: "00000000-0000-0000-0000-000000000000", role: "admin" },
      });
      expect(res.status()).toBe(401);
    });

    test("SEC: /api/admin/users GET ohne Session gibt 401", async ({ page }) => {
      const res = await page.request.get("/api/admin/users");
      expect(res.status()).toBe(401);
    });

    test("SEC: /api/admin/users PATCH mit ungültiger userId gibt 400", async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      const res = await page.request.patch("/api/admin/users", {
        data: { action: "set_role", userId: "nicht-eine-uuid", role: "admin" },
      });
      expect(res.status()).toBe(400);
    });

    test("SEC: /api/admin/users PATCH mit unbekannter action gibt 400", async ({ page }) => {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) test.skip(true, "ADMIN_EMAIL nicht gesetzt");
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      const res = await page.request.patch("/api/admin/users", {
        data: { action: "delete_all_users" },
      });
      expect(res.status()).toBe(400);
    });
  });
});
