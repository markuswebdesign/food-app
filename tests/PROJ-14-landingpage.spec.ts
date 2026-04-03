import { test, expect } from "@playwright/test";

// NOTE: PROJ-14 (Landingpage) wurde durch PROJ-16 (Redesign) visuell überarbeitet.
// Diese Tests prüfen weiterhin das strukturelle Verhalten (nicht spezifische Texte).
// Detaillierte Inhalts-Tests befinden sich in PROJ-16-landingpage-redesign.spec.ts

test.describe("PROJ-14: Landingpage (strukturelle Tests)", () => {
  // AC1: Route / zeigt Landingpage für nicht eingeloggte Nutzer
  test("AC: Route / zeigt Landingpage für nicht eingeloggte Nutzer", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // AC2: Hero-Section
  test("AC: Hero-Section zeigt H1-Headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("AC: Hero-Section zeigt CTA-Button 'Kostenlos starten'", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /kostenlos starten/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("AC: Hero-Section CTA-Button führt zur Registrierungsseite", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /kostenlos starten/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  // AC3: Feature-Section — 4 Kernfunktionen
  test("AC: Features-Leiste zeigt 4 Funktions-Labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Rezepte verwalten & importieren")).toBeVisible();
    await expect(page.getByText("Wochenplan erstellen")).toBeVisible();
    await expect(page.getByText("Einkaufsliste automatisch")).toBeVisible();
    await expect(page.getByText("Kalorien & Nährwerte tracken")).toBeVisible();
  });

  // AC4: Navigation
  test("AC: Navigation zeigt Logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByText(/food/i)).toBeVisible();
  });

  test("AC: Navigation zeigt Login-Button mit Link zu /login", async ({
    page,
  }) => {
    await page.goto("/");
    const loginLink = page.getByRole("banner").getByRole("link", { name: "Anmelden" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("AC: Navigation zeigt Registrieren-Button mit Link zu /register", async ({
    page,
  }) => {
    await page.goto("/");
    const registerLink = page
      .getByRole("banner")
      .getByRole("link", { name: /kostenlos starten/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("AC: Navigation Login-Button führt zu /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Anmelden" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  // AC5: Footer
  test("AC: Footer ist sichtbar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("AC: Footer enthält aktuelles Jahr", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText(/2026/)).toBeVisible();
  });

  // AC6: Responsive
  test("AC: Landingpage rendert korrekt auf Mobile (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /kostenlos starten/i }).first()
    ).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("AC: Landingpage rendert korrekt auf Tablet (768px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("AC: Landingpage rendert korrekt auf Desktop (1440px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // AC7: Keine JS-Fehler
  test("AC: Landingpage lädt ohne JavaScript-Fehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  // Edge Case: Layout auf sehr kleinen Geräten (320px)
  test("EC: Layout bricht nicht auf sehr kleinen Mobilgeräten (320px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(320);
  });
});
