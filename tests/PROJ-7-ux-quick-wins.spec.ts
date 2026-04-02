import { test, expect } from "@playwright/test";

test.describe("PROJ-7: UX Quick Wins", () => {
  // --- Teil 1 & 2: Passwort anzeigen ---

  test("AC: Login — Passwortfeld hat Auge-Icon", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#password")).toBeVisible();
    // Icon-Button neben dem Passwortfeld
    const toggle = page.locator("button[type=button]").filter({ has: page.locator("svg") }).first();
    await expect(toggle).toBeVisible();
  });

  test("AC: Login — Klick auf Auge-Icon wechselt Feldtyp password → text", async ({ page }) => {
    await page.goto("/login");
    const input = page.locator("#password");
    const toggle = page.locator("button[type=button]").filter({ has: page.locator("svg") }).first();

    await expect(input).toHaveAttribute("type", "password");
    await toggle.click();
    await expect(input).toHaveAttribute("type", "text");
    await toggle.click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("AC: Login — Passwortinhalt bleibt beim Umschalten erhalten", async ({ page }) => {
    await page.goto("/login");
    const input = page.locator("#password");
    const toggle = page.locator("button[type=button]").filter({ has: page.locator("svg") }).first();

    await input.fill("MeinPasswort123");
    await toggle.click();
    await expect(input).toHaveValue("MeinPasswort123");
  });

  test("AC: Registrierung — Passwortfeld hat Auge-Icon", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("#password")).toBeVisible();
    const toggle = page.locator("button[type=button]").filter({ has: page.locator("svg") }).first();
    await expect(toggle).toBeVisible();
  });

  test("AC: Registrierung — Klick auf Auge-Icon wechselt Feldtyp", async ({ page }) => {
    await page.goto("/register");
    const input = page.locator("#password");
    const toggle = page.locator("button[type=button]").filter({ has: page.locator("svg") }).first();

    await expect(input).toHaveAttribute("type", "password");
    await toggle.click();
    await expect(input).toHaveAttribute("type", "text");
  });

  // --- Teil 2: Passwort-Stärke ---

  test("AC: Registrierung — Stärke-Anzeige erscheint erst nach Eingabe", async ({ page }) => {
    await page.goto("/register");
    // Vor Eingabe kein Stärke-Label sichtbar
    await expect(page.getByText("Niedrig")).not.toBeVisible();
    await expect(page.getByText("Mittel")).not.toBeVisible();
    await expect(page.getByText("Sicher")).not.toBeVisible();
  });

  test("AC: Registrierung — kurzes einfaches Passwort zeigt 'Niedrig'", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#password").fill("abc");
    await expect(page.getByText("Niedrig")).toBeVisible();
  });

  test("AC: Registrierung — mittleres Passwort zeigt 'Mittel'", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#password").fill("Abcdefgh");
    await expect(page.getByText("Mittel")).toBeVisible();
  });

  test("AC: Registrierung — starkes Passwort zeigt 'Sicher'", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#password").fill("Abcdefg1");
    await expect(page.getByText("Sicher")).toBeVisible();
  });

  test("AC: Registrierung — 3 Balken sichtbar wenn Passwort eingegeben", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#password").fill("abc");
    const bars = page.locator(".h-1.flex-1.rounded-full");
    await expect(bars).toHaveCount(3);
  });

  // --- Teil 3: Mobile Sidebar Auto-Close ---

  test("AC: Mobile (375px) — Sidebar standardmäßig geschlossen beim Laden", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    // Sheet content sollte nicht sichtbar sein
    await expect(page.getByRole("navigation").filter({ hasText: "Wochenplan" })).not.toBeVisible();
  });

  test("AC: Login-Seite lädt ohne JavaScript-Fehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("AC: Registrierungsseite lädt ohne JavaScript-Fehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("AC: Login rendert korrekt auf Mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /anmelden/i })).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("AC: Registrierung rendert korrekt auf Mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /registrieren/i })).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });
});
