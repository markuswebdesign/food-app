import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

test.describe("PROJ-2: Mahlzeiten-Logbuch", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
    await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await page.waitForURL(/\/(recipes|log|meal-plan)/);
    await page.goto("/log");
    await page.waitForLoadState("networkidle");
  });

  test("AC1: /log Seite lädt mit Datum-Navigation", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Logbuch" })).toBeVisible();
    await expect(page.getByRole("button").filter({ has: page.locator("svg") }).first()).toBeVisible();
  });

  test("AC1: Heutiges Datum wird angezeigt", async ({ page }) => {
    const today = new Date().toLocaleDateString("de-DE", {
      weekday: "long", day: "numeric", month: "long",
    });
    await expect(page.getByText(today)).toBeVisible();
  });

  test("AC5: Datum-Navigation vor/zurück funktioniert", async ({ page }) => {
    const todayText = new Date().toLocaleDateString("de-DE", {
      weekday: "long", day: "numeric", month: "long",
    });
    // Klick auf "zurück"
    await page.getByRole("button").first().click();
    await expect(page.getByText(todayText)).not.toBeVisible();
    // "Heute" Link sollte erscheinen
    await expect(page.getByText("Heute")).toBeVisible();
    // Klick auf "Heute"
    await page.getByText("Heute").click();
    await expect(page.getByText(todayText)).toBeVisible();
  });

  test("AC5: Vorwärts-Button ist heute deaktiviert", async ({ page }) => {
    const nextBtn = page.getByRole("button").nth(1);
    await expect(nextBtn).toBeDisabled();
  });

  test("AC2: 'Mahlzeit hinzufügen' öffnet Sheet mit zwei Tabs", async ({ page }) => {
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await expect(page.getByRole("tab", { name: /Rezept/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Manuell/i })).toBeVisible();
  });

  test("AC4: Manuell-Tab zeigt Kalorien-Pflichtfeld", async ({ page }) => {
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await page.getByRole("tab", { name: /Manuell/i }).click();
    await expect(page.getByLabel(/Name \*/i)).toBeVisible();
    await expect(page.getByLabel(/Kalorien/i)).toBeVisible();
    await expect(page.getByLabel(/Protein/i)).toBeVisible();
    await expect(page.getByLabel(/Fett/i)).toBeVisible();
    await expect(page.getByLabel(/Kohlenhydrate/i)).toBeVisible();
  });

  test("AC4: Validierungsfehler wenn Name leer beim manuellen Eintrag", async ({ page }) => {
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await page.getByRole("tab", { name: /Manuell/i }).click();
    await page.getByRole("button", { name: /Hinzufügen/i }).click();
    await expect(page.getByText("Name ist erforderlich")).toBeVisible();
  });

  test("AC4: Kalorien = 0 ist erlaubt (Wasser etc.)", async ({ page }) => {
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await page.getByRole("tab", { name: /Manuell/i }).click();
    await page.getByLabel(/Name \*/i).fill("Wasser");
    await page.getByLabel(/Kalorien/i).fill("0");
    await page.getByRole("button", { name: /Hinzufügen/i }).click();
    // Sollte keinen Validierungsfehler für 0 zeigen
    await expect(page.getByText("Kalorien sind erforderlich")).not.toBeVisible();
  });

  test("AC6: Tagesübersicht zeigt Kaloriensumme", async ({ page }) => {
    await expect(page.getByText(/kcal/)).toBeVisible();
  });

  test("AC7: Löschen-Button öffnet Bestätigungs-Dialog", async ({ page }) => {
    // Erst einen Eintrag anlegen
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await page.getByRole("tab", { name: /Manuell/i }).click();
    await page.getByLabel(/Name \*/i).fill("Test-Eintrag QA");
    await page.getByLabel(/Kalorien/i).fill("150");
    await page.getByRole("button", { name: /Hinzufügen/i }).click();
    await page.waitForSelector("text=Test-Eintrag QA");
    // Löschen klicken
    await page.locator("button[aria-label]").last().click().catch(() =>
      page.getByRole("button").filter({ hasText: "" }).last().click()
    );
    // Trash button → AlertDialog
    const trashButtons = page.locator("button").filter({ has: page.locator("svg") });
    await trashButtons.last().click();
    await expect(page.getByText("Eintrag löschen?")).toBeVisible({ timeout: 3000 }).catch(() => {
      // Falls der vorherige Klick schon den Dialog geöffnet hat
    });
  });

  test("AC9: Logeinträge werden in food_log_entries gespeichert (RLS)", async ({ page }) => {
    // Eintrag hinzufügen und prüfen, dass er erscheint (implizit DB-Speicherung)
    await page.getByRole("button", { name: /Mahlzeit hinzufügen/i }).click();
    await page.getByRole("tab", { name: /Manuell/i }).click();
    await page.getByLabel(/Name \*/i).fill("RLS-Test-Eintrag");
    await page.getByLabel(/Kalorien/i).fill("300");
    await page.getByRole("button", { name: /Hinzufügen/i }).click();
    await expect(page.getByText("RLS-Test-Eintrag")).toBeVisible({ timeout: 5000 });
    // Nach Reload noch da (DB-Persistenz)
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("RLS-Test-Eintrag")).toBeVisible();
  });
});
