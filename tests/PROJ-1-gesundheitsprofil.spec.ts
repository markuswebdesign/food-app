import { test, expect } from "@playwright/test";

// E2E tests für PROJ-1: Gesundheitsprofil + TDEE-Rechner
// Voraussetzung: TEST_USER_EMAIL und TEST_USER_PASSWORD müssen als env vars gesetzt sein
// oder ein bereits eingeloggter Browser-State wird verwendet.

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

test.describe("PROJ-1: Gesundheitsprofil + TDEE-Rechner", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt — E2E übersprungen");
    }
    // Login
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
    await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await page.waitForURL(/\/(recipes|profile|meal-plan)/);
    // Zur Profilseite navigieren
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("AC1: Profilseite zeigt Formularfelder für Gewicht, Größe, Alter, Aktivitätslevel und Ziel", async ({ page }) => {
    await expect(page.getByLabel("Gewicht (kg)")).toBeVisible();
    await expect(page.getByLabel("Größe (cm)")).toBeVisible();
    await expect(page.getByLabel("Alter (Jahre)")).toBeVisible();
    await expect(page.getByLabel("Aktivitätslevel")).toBeVisible();
    await expect(page.getByRole("button", { name: "Abnehmen" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Gewicht halten" })).toBeVisible();
  });

  test("AC2: TDEE wird live berechnet wenn alle Felder ausgefüllt sind", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    // TDEE-Vorschau sollte erscheinen
    await expect(page.getByText("kcal Grundbedarf")).toBeVisible();
  });

  test("AC3: Bei Ziel 'Abnehmen' ist Kalorienziel = TDEE - 500", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    await page.getByRole("button", { name: "Abnehmen" }).click();
    await expect(page.getByText("Kalorienziel (−500)")).toBeVisible();
  });

  test("AC4: Bei Ziel 'Gewicht halten' ist Kalorienziel = TDEE", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    await page.getByRole("button", { name: "Gewicht halten" }).click();
    await expect(page.getByText(/Kalorienziel$/)).toBeVisible();
    // Beide Werte sollten gleich sein
    const tdeeText = await page.locator(".text-2xl.font-bold").first().textContent();
    const goalText = await page.locator(".text-2xl.font-bold.text-primary").textContent();
    expect(tdeeText?.replace(/\D/g, "")).toBe(goalText?.replace(/\D/g, ""));
  });

  test("AC5: Manuelles Kalorienziel überschreibt die automatische Berechnung", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    await page.getByPlaceholder("z.B. 1800").fill("1600");
    await expect(page.getByText("Manuelles Ziel")).toBeVisible();
    await expect(page.getByText("1.600")).toBeVisible();
  });

  test("AC7: Validierungsfehler für ungültiges Gewicht (> 300 kg)", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("500");
    await page.getByRole("button", { name: "Profil speichern" }).click();
    await expect(page.getByText("Gewicht muss zwischen 30 und 300 kg liegen")).toBeVisible();
  });

  test("AC7: Validierungsfehler für ungültige Größe (< 100 cm)", async ({ page }) => {
    await page.getByLabel("Größe (cm)").fill("50");
    await page.getByRole("button", { name: "Profil speichern" }).click();
    await expect(page.getByText("Größe muss zwischen 100 und 250 cm liegen")).toBeVisible();
  });

  test("AC8: Profil wird gespeichert und Erfolgsmeldung erscheint", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    await page.getByRole("button", { name: "Profil speichern" }).click();
    await expect(page.getByText("Gespeichert!")).toBeVisible({ timeout: 5000 });
  });

  test("Edge: TDEE-Vorschau erscheint NICHT wenn Felder leer sind", async ({ page }) => {
    await expect(page.getByText("kcal Grundbedarf")).not.toBeVisible();
    await expect(page.getByText("Fülle Gewicht, Größe, Alter")).toBeVisible();
  });

  test("Edge: Manuelles Ziel zurücksetzen → automatische Berechnung aktiv", async ({ page }) => {
    await page.getByLabel("Gewicht (kg)").fill("75");
    await page.getByLabel("Größe (cm)").fill("175");
    await page.getByLabel("Alter (Jahre)").fill("30");
    await page.getByLabel("Aktivitätslevel").click();
    await page.getByRole("option", { name: /sitzend/i }).click();
    await page.getByPlaceholder("z.B. 1800").fill("1600");
    await page.getByRole("button", { name: "Zurücksetzen" }).click();
    await expect(page.getByText("Manuelles Ziel")).not.toBeVisible();
  });
});
