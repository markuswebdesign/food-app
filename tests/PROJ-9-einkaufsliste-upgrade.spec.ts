import { test, expect } from "@playwright/test";

// PROJ-9: Einkaufsliste Upgrade – Kategorien
// E2E Tests für die automatische Kategorisierung der Einkaufsliste
// Voraussetzung: TEST_USER_EMAIL und TEST_USER_PASSWORD müssen als env vars gesetzt sein

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

async function login(page: any) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|profile|meal-plan|me)/);
}

test.describe("PROJ-9: Einkaufsliste Kategorisierung (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt — E2E übersprungen");
    }
    await login(page);
    // Clear localStorage before each test
    await page.goto("/shopping-list");
    await page.evaluate(() => {
      localStorage.removeItem("shopping-list-manual");
      localStorage.removeItem("shopping-list-checked");
    });
  });

  // AC: Seite lädt ohne JavaScript-Fehler
  test("AC: Einkaufsliste lädt ohne JavaScript-Fehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err: Error) => errors.push(err.message));
    await page.goto("/shopping-list");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  // AC: Manuelle Items werden nach Kategorie gruppiert angezeigt
  test("AC: Manuelle Items werden nach Kategorie gruppiert", async ({ page }) => {
    await page.evaluate(() => {
      const items = [
        { id: "1", name: "Karotte", amount: "500", unit: "g" },
        { id: "2", name: "Hähnchenbrust", amount: "300", unit: "g" },
        { id: "3", name: "Milch", amount: "1", unit: "L" },
        { id: "4", name: "Nudeln", amount: "500", unit: "g" },
      ];
      localStorage.setItem("shopping-list-manual", JSON.stringify(items));
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Category headers should be visible
    await expect(page.getByText("Gemüse & Obst")).toBeVisible();
    await expect(page.getByText("Fleisch & Fisch")).toBeVisible();
    await expect(page.getByText("Milchprodukte & Eier")).toBeVisible();
    await expect(page.getByText("Konserven & Trockenware")).toBeVisible();
  });

  // AC: Zutaten ohne Kategorie-Match landen unter Sonstiges
  test("AC: Unbekannte Zutaten landen unter Sonstiges", async ({ page }) => {
    await page.evaluate(() => {
      const items = [{ id: "u1", name: "Quinoa Superfood", amount: "200", unit: "g" }];
      localStorage.setItem("shopping-list-manual", JSON.stringify(items));
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Sonstiges")).toBeVisible();
  });

  // AC: Nur Kategorien mit Items werden angezeigt
  test("AC: Nur Kategorien mit Items werden angezeigt", async ({ page }) => {
    await page.evaluate(() => {
      const items = [{ id: "v1", name: "Tomate", amount: "4", unit: "Stück" }];
      localStorage.setItem("shopping-list-manual", JSON.stringify(items));
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Gemüse & Obst")).toBeVisible();
    await expect(page.getByText("Fleisch & Fisch")).not.toBeVisible();
  });

  // AC: Items können abgehakt und unter Erledigt angezeigt werden
  test("AC: Items können als erledigt markiert werden", async ({ page }) => {
    await page.evaluate(() => {
      const items = [{ id: "c1", name: "Butter", amount: "250", unit: "g" }];
      localStorage.setItem("shopping-list-manual", JSON.stringify(items));
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const checkbox = page.getByRole("checkbox").first();
    await checkbox.click();
    await expect(page.getByText(/Erledigt/)).toBeVisible();
  });

  // AC: Manuell hinzugefügte Zutat erscheint unter korrekter Kategorie
  test("AC: Manuelle Zutat erscheint unter korrekter Kategorie", async ({ page }) => {
    await page.getByPlaceholder("Menge").fill("200");
    await page.getByPlaceholder("Einheit").fill("g");
    await page.getByPlaceholder("Zutat manuell hinzufügen...").fill("Lachs");
    await page.getByRole("button", { name: "+" }).click();

    await expect(page.getByText("Fleisch & Fisch")).toBeVisible();
    await expect(page.getByText("Lachs")).toBeVisible();
  });

  // AC: Einkaufsliste ist korrekt auf Mobile (375px)
  test("AC: Einkaufsliste lädt korrekt auf Mobile 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Einkaufsliste" })).toBeVisible();
  });

  // AC: Erledigte Items können gelöscht werden
  test("AC: Erledigte Items können gelöscht werden", async ({ page }) => {
    await page.evaluate(() => {
      const items = [{ id: "d1", name: "Salz", amount: "1", unit: "Päckchen" }];
      localStorage.setItem("shopping-list-manual", JSON.stringify(items));
      localStorage.setItem("shopping-list-checked", JSON.stringify(["d1"]));
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const clearBtn = page.getByRole("button", { name: /Erledigte löschen/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(page.getByText("Salz")).not.toBeVisible();
  });
});

// Tests that don't require auth (public pages / API)
test.describe("PROJ-9: Einkaufsliste (ohne Auth)", () => {
  // AC: Seite lädt ohne JavaScript-Fehler (unauthenticated → redirect to login is ok)
  test("AC: Einkaufsliste lädt ohne JavaScript-Fehler (unauthenticated)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err: Error) => errors.push(err.message));
    await page.goto("/shopping-list");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
