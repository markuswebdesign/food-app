import { test, expect } from "@playwright/test";

test.describe("PROJ-16: Landingpage Redesign (Greenive-Style)", () => {
  // ─── Navigation ─────────────────────────────────────────────────────────────

  test("AC: Nav ist sticky / fixed oben", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    const position = await header.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("fixed");
  });

  test("AC: Nav enthält Logo 'food.'", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByText(/food/i)).toBeVisible();
  });

  test("AC: Nav enthält Login-Link zu /login", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("banner").getByRole("link", { name: /anmelden/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("AC: Nav enthält Register-Link zu /register", async ({ page }) => {
    await page.goto("/");
    const registerLink = page
      .getByRole("banner")
      .getByRole("link", { name: /kostenlos starten/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  // ─── Hero Section ────────────────────────────────────────────────────────────

  test("AC: Hero zeigt H1-Headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("AC: Hero enthält Gold-CTA-Button 'Kostenlos starten' → /register", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("main").getByRole("link", { name: /kostenlos starten/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("AC: Hero enthält Sekundär-Link 'Mehr erfahren'", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mehr erfahren")).toBeVisible();
  });

  // ─── Features-Leiste (Benefits Strip) ───────────────────────────────────────

  test("AC: Features-Leiste zeigt 4 Funktions-Labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Rezepte verwalten & importieren")).toBeVisible();
    await expect(page.getByText("Wochenplan erstellen")).toBeVisible();
    await expect(page.getByText("Einkaufsliste automatisch")).toBeVisible();
    await expect(page.getByText("Kalorien & Nährwerte tracken")).toBeVisible();
  });

  // ─── Mission Section ─────────────────────────────────────────────────────────

  test("AC: Mission-Sektion ist sichtbar mit H2", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/gesünder essen/i)).toBeVisible();
  });

  // ─── Feature-Showcase ────────────────────────────────────────────────────────

  test("AC: Feature-Showcase zeigt 3 Feature-Überschriften", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Rezeptverwaltung" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wochenplanung" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /kalorien/i })).toBeVisible();
  });

  // ─── Stats Strip ─────────────────────────────────────────────────────────────

  test("AC: Stats-Leiste zeigt mindestens 3 Kennzahlen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("500+")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("3-in-1")).toBeVisible();
  });

  // ─── Testimonials ────────────────────────────────────────────────────────────

  test("AC: Testimonials-Sektion zeigt mindestens 3 Zitat-Karten", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Sophie M.")).toBeVisible();
    await expect(page.getByText("Tobias R.")).toBeVisible();
    await expect(page.getByText("Jana K.")).toBeVisible();
  });

  // ─── FAQ Accordion ──────────────────────────────────────────────────────────

  test("AC: FAQ zeigt mindestens 4 Fragen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/ist foodapp wirklich kostenlos/i)).toBeVisible();
    await expect(page.getByText(/muss ich jeden tag perfekt tracken/i)).toBeVisible();
    await expect(page.getByText(/funktioniert das auf dem handy/i)).toBeVisible();
    await expect(page.getByText(/wie importiere ich rezepte/i)).toBeVisible();
  });

  test("AC: FAQ Akkordeon öffnet Antwort beim Klick", async ({ page }) => {
    await page.goto("/");
    const firstFaq = page.getByText(/ist foodapp wirklich kostenlos/i);
    await firstFaq.click();
    await expect(page.getByText(/alle kernfunktionen nutzen/i)).toBeVisible();
  });

  // ─── CTA Banner ─────────────────────────────────────────────────────────────

  test("AC: CTA-Banner enthält Register-Button", async ({ page }) => {
    await page.goto("/");
    const ctaBanner = page.getByText(/dein erster wochenplan/i);
    await expect(ctaBanner).toBeVisible();
    const ctaLink = page
      .getByRole("link", { name: /jetzt kostenlos starten/i })
      .last();
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute("href", "/register");
  });

  // ─── Footer ─────────────────────────────────────────────────────────────────

  test("AC: Footer enthält Logo und Copyright-Zeile", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("food.")).toBeVisible();
    await expect(footer.getByText(/2026/)).toBeVisible();
  });

  test("AC: Footer enthält Datenschutz- und Impressum-Links", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /datenschutz/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /impressum/i })).toBeVisible();
  });

  // ─── Auth Redirect ────────────────────────────────────────────────────────────

  test("AC: Nicht-eingeloggte Nutzer sehen Landingpage (kein Redirect)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // ─── Responsive ──────────────────────────────────────────────────────────────

  test("AC: Mobile (375px) — kein horizontaler Scroll, H1 sichtbar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test("AC: Tablet (768px) — H1 und Stats sichtbar", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("500+")).toBeVisible();
  });

  test("AC: Desktop (1280px) — alle Hauptsektionen sichtbar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("500+")).toBeVisible();
    await expect(page.getByText("Sophie M.")).toBeVisible();
  });

  // ─── Edge Cases ─────────────────────────────────────────────────────────────

  test("EC: Sehr kleines Gerät (320px) — kein Layout-Bruch", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });

  test("EC: Keine JavaScript-Fehler beim Laden", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("EC: Unsplash-Bilder werden geladen (kein 404)", async ({ page }) => {
    const failedImages: string[] = [];
    page.on("response", (res) => {
      if (res.url().includes("unsplash.com") && res.status() >= 400) {
        failedImages.push(res.url());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(failedImages).toHaveLength(0);
  });
});
