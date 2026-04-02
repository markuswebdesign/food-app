import { test, expect } from "@playwright/test";

test.describe("PROJ-14: Landingpage", () => {
  // AC1: Route / zeigt Landingpage für nicht eingeloggte Nutzer
  test("AC: Route / zeigt Landingpage für nicht eingeloggte Nutzer", async ({
    page,
  }) => {
    await page.goto("/");
    // Sollte nicht zu /login oder /me weitergeleitet werden
    await expect(page).toHaveURL("http://localhost:3000/");
    // Landingpage-Inhalt sichtbar
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // AC2: Hero-Section
  test("AC: Hero-Section zeigt App-Name / Headline", async ({ page }) => {
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

  // AC3: Feature-Section — mindestens 4 Kernfunktionen
  test("AC: Feature-Section zeigt mindestens 4 Funktions-Karten", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Rezeptverwaltung & Import" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wochenplanung" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Einkaufsliste" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kalorientracking & Nährwerte" })).toBeVisible();
  });

  test("AC: Jede Feature-Karte enthält eine Beschreibung", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Eigene Rezepte erstellen/)).toBeVisible();
    await expect(page.getByText(/Mahlzeiten für die ganze Woche/)).toBeVisible();
    await expect(page.getByText(/Automatisch aus dem Wochenplan/)).toBeVisible();
    await expect(page.getByText(/Täglichen Kalorienbedarf/)).toBeVisible();
  });

  // AC4: Navigation
  test("AC: Navigation zeigt Logo / App-Name", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByText(/FoodApp/)).toBeVisible();
  });

  test("AC: Navigation zeigt Login-Button mit Link zu /login", async ({
    page,
  }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: /anmelden/i });
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
    await page.getByRole("link", { name: /anmelden/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  // AC5: Footer
  test("AC: Footer ist sichtbar und enthält App-Name", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/FoodApp/)).toBeVisible();
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
    // Layout bricht nicht — kein horizontaler Scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("AC: Landingpage rendert korrekt auf Tablet (768px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Rezeptverwaltung & Import")).toBeVisible();
  });

  test("AC: Landingpage rendert korrekt auf Desktop (1440px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Wochenplanung")).toBeVisible();
  });

  // AC7: Keine JS-Fehler (Proxy für Ladezeit + Stabilität)
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
