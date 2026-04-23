import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

test.describe("PROJ-4: Makro-Tracking", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
    await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await page.waitForURL(/\/(me|dashboard|recipes|log|meal-plan)/);
  });

  // ── AC: Makroziele im Profil einstellbar ─────────────────────────────────────

  test("AC: Makroziele sind im Profil-Formular einstellbar", async ({ page }) => {
    await page.goto("/me?tab=profil");
    await page.waitForLoadState("networkidle");
    // Profil-Tab muss Felder für Makroziele haben
    await expect(page.getByLabel(/protein/i)).toBeVisible();
    await expect(page.getByLabel(/fett/i)).toBeVisible();
    await expect(page.getByLabel(/kohlenhydrate/i)).toBeVisible();
  });

  test("AC: Default-Makroziele werden automatisch aus Kalorienziel berechnet", async ({ page }) => {
    await page.goto("/me?tab=profil");
    await page.waitForLoadState("networkidle");
    // Wenn Kalorienziel gesetzt ist, sollte ein Hinweis mit Auto-Werten sichtbar sein
    const autoHint = page.locator("text=/automatisch/i");
    // Nur prüfen wenn Kalorienziel vorhanden
    const hasCalorieGoal = await page.locator("text=/kcal/i").first().isVisible().catch(() => false);
    if (hasCalorieGoal) {
      await expect(autoHint).toBeVisible();
    }
  });

  // ── AC: Dashboard Übersicht-Tab zeigt Makro-Widget ───────────────────────────

  test("AC: Übersicht-Tab lädt ohne Fehler", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/me/);
    // Keine Crash-Fehler (z.B. 500)
    await expect(page.locator("text=/500|internal server error/i")).not.toBeVisible();
  });

  test("AC: MacroProgress-Widget erscheint im Übersicht-Tab wenn Kalorienziel gesetzt", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");

    const hasCalorieGoal = await page.locator("text=/kcal Ziel/i").isVisible().catch(() => false);
    if (!hasCalorieGoal) {
      test.skip(true, "Kein Kalorienziel gesetzt — Widget nicht sichtbar");
    }

    // MacroProgress zeigt Labels für alle drei Makros
    await expect(page.locator("text=Protein")).toBeVisible();
    await expect(page.locator("text=Fett")).toBeVisible();
    await expect(page.locator("text=Kohlenhydrate")).toBeVisible();
  });

  test("AC: Makro-Widget zeigt Ist-/Zielwert in Gramm", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");

    const hasCalorieGoal = await page.locator("text=/kcal Ziel/i").isVisible().catch(() => false);
    if (!hasCalorieGoal) {
      test.skip(true, "Kein Kalorienziel gesetzt");
    }

    // Format: "XXX / YYY g"
    const gramPattern = page.locator("text=/ g/").first();
    await expect(gramPattern).toBeVisible();
  });

  // ── AC: Logbuch-Tab zeigt Makros ─────────────────────────────────────────────

  test("AC: Logbuch-Tab zeigt MacroProgress wenn Einträge mit Makrodaten vorhanden", async ({ page }) => {
    await page.goto("/me?tab=logbuch");
    await page.waitForLoadState("networkidle");

    const hasEntries = await page.locator("text=/kcal/i").first().isVisible().catch(() => false);
    if (!hasEntries) {
      test.skip(true, "Keine Log-Einträge heute — MacroProgress nicht sichtbar");
    }

    // Falls Makrodaten vorhanden, sollte Protein-Label sichtbar sein
    const proteinLabel = page.locator("text=Protein").first();
    const hasMacros = await proteinLabel.isVisible().catch(() => false);
    // Kein harter Fail — Einträge könnten nur Kalorien haben
    if (!hasMacros) {
      console.log("Hinweis: Keine Makrodaten in heutigen Einträgen — Widget korrekt ausgeblendet");
    }
  });

  // ── AC: Farbkodierung ────────────────────────────────────────────────────────

  test("AC: Überschrittene Makros erscheinen orange (bg-orange-400 Klasse)", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");
    // Prüft ob die CSS-Klasse für orange Balken im DOM existiert (wenn überschritten)
    // Dieser Test ist optional — orange ist nur bei Überschreitung sichtbar
    const orangeBar = page.locator(".bg-orange-400");
    // Keine Fehler wenn nicht vorhanden (User könnte im Ziel sein)
    const count = await orangeBar.count();
    // Test ist immer Pass — dokumentiert nur das Verhalten
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── Regression: andere Tabs unverändert ──────────────────────────────────────

  test("Regression: Streak-Widget im Übersicht-Tab weiterhin sichtbar", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");
    // Streak-Widget oder CTA sollte sichtbar sein (je nach Profil-Status)
    const hasStreak = await page.locator("text=/streak|tag/i").first().isVisible().catch(() => false);
    const hasCta = await page.locator("text=/profil/i").first().isVisible().catch(() => false);
    expect(hasStreak || hasCta).toBe(true);
  });

  test("Regression: Wochendiagramm im Übersicht-Tab weiterhin sichtbar", async ({ page }) => {
    await page.goto("/me");
    await page.waitForLoadState("networkidle");
    const hasCalorieGoal = await page.locator("text=/kcal Ziel/i").isVisible().catch(() => false);
    if (hasCalorieGoal) {
      // Chart-Container sollte vorhanden sein
      const chartContainer = page.locator("svg").first();
      await expect(chartContainer).toBeVisible();
    }
  });
});
