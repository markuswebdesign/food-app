import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

test.describe("PROJ-3: Kalorie-Defizit Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
    await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await page.waitForURL(/\/(dashboard|recipes|log|meal-plan)/);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("AC: / leitet auf /dashboard weiter", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("AC: Dashboard-Seite lädt mit Überschrift", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("AC: Dashboard zeigt 'Heute'-Widget mit kcal-Anzeige oder Leer-Zustand", async ({ page }) => {
    // Entweder kcal-Wert oder "Noch nichts geloggt"
    const hasKcal = await page.getByText(/kcal/).first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/Noch nichts geloggt/).isVisible().catch(() => false);
    const hasProfileCta = await page.getByText(/Profil vervollständigen/).isVisible().catch(() => false);
    expect(hasKcal || hasEmpty || hasProfileCta).toBe(true);
  });

  test("AC: Wochenbalken-Chart zeigt 7 Tage Mo–So", async ({ page }) => {
    // Nur prüfen wenn kein Profil-CTA angezeigt wird
    const profileCta = page.getByText(/Profil vervollständigen/);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Profil vorhanden — Wochenbalken nicht sichtbar");
    }
    for (const label of ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("AC: Wochensumme zeigt Defizit oder Überschuss Text", async ({ page }) => {
    const profileCta = page.getByText(/Profil vervollständigen/);
    if (await profileCta.isVisible()) {
      test.skip(true, "Kein Profil vorhanden — Wochensumme nicht sichtbar");
    }
    const defizit = await page.getByText(/kcal Defizit diese Woche/i).isVisible().catch(() => false);
    const ueberschuss = await page.getByText(/kcal Überschuss diese Woche/i).isVisible().catch(() => false);
    const ausgeglichen = await page.getByText(/Ausgeglichen diese Woche/i).isVisible().catch(() => false);
    expect(defizit || ueberschuss || ausgeglichen).toBe(true);
  });

  test("AC: Kein-Profil-Zustand zeigt CTA mit Link zu /profile", async ({ page }) => {
    // Wenn kein Profil: CTA-Button vorhanden
    const profileCta = page.getByRole("link", { name: /Profil vervollständigen/i });
    if (!await profileCta.isVisible()) {
      // Profil ist bereits gesetzt — dieser Test ist N/A für diesen User
      test.skip(true, "Profil bereits vorhanden — CTA-Test nicht anwendbar");
    }
    await expect(profileCta).toHaveAttribute("href", "/profile");
  });

  test("AC: 'Noch nichts geloggt' zeigt Link zum Logbuch", async ({ page }) => {
    const empty = page.getByText(/Noch nichts geloggt/);
    if (!await empty.isVisible()) {
      test.skip(true, "Heute wurden bereits Einträge geloggt — Empty-State nicht sichtbar");
    }
    await expect(page.getByRole("link", { name: /Zum Logbuch/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Zum Logbuch/i })).toHaveAttribute("href", "/log");
  });

  test("AC: Dashboard lädt ohne JavaScript-Fehler (SSR)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("AC: Nicht-angemeldeter Nutzer wird zu /login weitergeleitet", async ({ page: unauthPage }) => {
    await unauthPage.goto("/dashboard");
    await unauthPage.waitForURL(/\/login/);
    await expect(unauthPage).toHaveURL(/\/login/);
  });

  test("Responsiv: Dashboard rendert auf Mobilgröße (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("Responsiv: Dashboard rendert auf Desktop (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
