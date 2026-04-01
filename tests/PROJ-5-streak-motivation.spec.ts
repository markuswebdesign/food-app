import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

test.describe("PROJ-5: Streak & Motivation", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
    await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await page.waitForURL(/\/(me|dashboard|recipes|log|meal-plan)/);
    await page.goto("/me?tab=ubersicht");
    await page.waitForLoadState("networkidle");
  });

  test("AC: StreakWidget erscheint im Übersicht-Tab wenn Kalorienziel gesetzt", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil vorhanden — StreakWidget nicht sichtbar");
    }
    await expect(page.getByText("Streak")).toBeVisible();
  });

  test("AC: StreakWidget zeigt Tage-Anzeige", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil vorhanden");
    }
    await expect(page.getByText(/Tag[e]?$/).first()).toBeVisible();
  });

  test("AC: StreakWidget zeigt Motivationstext", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil vorhanden");
    }
    const texts = [
      "Super, weiter so!",
      "Morgen ist ein neuer Tag",
      "Vergiss nicht zu loggen",
    ];
    let found = false;
    for (const text of texts) {
      if (await page.getByText(text).isVisible().catch(() => false)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("AC: StreakWidget zeigt Rekord-Anzeige wenn Streak > 0", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil vorhanden");
    }
    // Rekord wird nur angezeigt wenn longestStreak > 0
    const rekord = page.getByText(/Rekord:/);
    const streakZero = await page.getByText("0").first().isVisible().catch(() => false);
    if (streakZero) {
      test.skip(true, "Kein Streak vorhanden — Rekord-Anzeige nicht relevant");
    }
    await expect(rekord).toBeVisible();
  });

  test("AC: Kein StreakWidget ohne Kalorienziel", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (!await profileCta.isVisible()) {
      test.skip(true, "Profil vorhanden — dieser Test gilt für Nutzer ohne Profil");
    }
    await expect(page.getByText("Streak")).not.toBeVisible();
  });

  test("AC: BadgesSection im Profil-Tab sichtbar (immer)", async ({ page }) => {
    await page.goto("/me?tab=profil");
    await page.waitForLoadState("networkidle");
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil — BadgesSection nicht angezeigt");
    }
    await expect(page.getByText("Abzeichen")).toBeVisible();
  });

  test("AC: BadgesSection zeigt alle 3 Badge-Typen", async ({ page }) => {
    await page.goto("/me?tab=profil");
    await page.waitForLoadState("networkidle");
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Kalorienprofil — BadgesSection nicht angezeigt");
    }
    await expect(page.getByText("7-Tage-Streak")).toBeVisible();
    await expect(page.getByText("14-Tage-Streak")).toBeVisible();
    await expect(page.getByText("30-Tage-Streak")).toBeVisible();
  });

  test("AC: /me lädt ohne JavaScript-Fehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/me?tab=ubersicht");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("AC: Nicht-angemeldeter Nutzer wird zu /login weitergeleitet", async ({ page: unauthPage }) => {
    await unauthPage.goto("/me");
    await unauthPage.waitForURL(/\/login/);
    await expect(unauthPage).toHaveURL(/\/login/);
  });

  test("Responsiv: StreakWidget rendert auf Mobilgröße (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me?tab=ubersicht");
    await page.waitForLoadState("networkidle");
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Profil — StreakWidget nicht sichtbar");
    }
    await expect(page.getByText("Streak")).toBeVisible();
  });

  test("Responsiv: BadgesSection rendert auf Desktop (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/me?tab=profil");
    await page.waitForLoadState("networkidle");
    const profileCta = page.getByText(/Profil vervollständigen/i);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Profil — BadgesSection nicht sichtbar");
    }
    await expect(page.getByText("Abzeichen")).toBeVisible();
  });
});
