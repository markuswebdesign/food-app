import { test, expect } from "@playwright/test";

// Tests that rely on Supabase email confirmation flow cannot be fully automated
// without a real test email account. These tests cover the UI behavior that
// can be verified without triggering actual emails.

test.describe("PROJ-6: E-Mail Bestätigung — UI & Flow", () => {
  test("Registrierungsseite lädt und zeigt alle Felder", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /registrieren/i })).toBeVisible();
    await expect(page.getByLabel(/benutzername/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/passwort/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /konto erstellen/i })).toBeVisible();
  });

  test("AC: /verify-email Seite lädt mit korrektem Inhalt", async ({ page }) => {
    await page.goto("/verify-email?email=test%40beispiel.de");
    await expect(page.getByText("Fast geschafft!")).toBeVisible();
    await expect(page.getByText("test@beispiel.de")).toBeVisible();
    await expect(page.getByRole("button", { name: /e-mail erneut senden/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /zurück zum login/i })).toBeVisible();
  });

  test("AC: /verify-email ohne Email-Param — Button ist deaktiviert", async ({ page }) => {
    await page.goto("/verify-email");
    const button = page.getByRole("button", { name: /e-mail erneut senden/i });
    await expect(button).toBeDisabled();
  });

  test("AC: /verify-email zeigt Mail-Icon und Hinweis auf Spam-Ordner", async ({ page }) => {
    await page.goto("/verify-email?email=test%40beispiel.de");
    await expect(page.getByText(/spam/i)).toBeVisible();
  });

  test("AC: Login-Seite zeigt Fehlermeldung bei abgelaufenem Bestätigungslink", async ({ page }) => {
    await page.goto("/login?error=confirmation_failed");
    await expect(page.getByText(/bestätigungslink ist ungültig oder abgelaufen/i)).toBeVisible();
  });

  test("AC: Login-Seite lädt ohne Fehler-Banner wenn kein error-Param", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/bestätigungslink ist ungültig/i)).not.toBeVisible();
  });

  test("AC: /verify-email — 'Zurück zum Login' Link navigiert zu /login", async ({ page }) => {
    await page.goto("/verify-email?email=test%40beispiel.de");
    await page.getByRole("link", { name: /zurück zum login/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("AC: /auth/callback ohne Code leitet zu /login?error=confirmation_failed weiter", async ({ page }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/login\?error=confirmation_failed/);
    await expect(page.getByText(/bestätigungslink ist ungültig oder abgelaufen/i)).toBeVisible();
  });

  test("AC: /verify-email rendert auf Mobilgröße (375px) ohne Layout-Bruch", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/verify-email?email=test%40beispiel.de");
    await expect(page.getByText("Fast geschafft!")).toBeVisible();
    await expect(page.getByRole("button", { name: /e-mail erneut senden/i })).toBeVisible();
  });

  test("AC: Login-Seite ohne JavaScript-Fehler (SSR/Hydration)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("AC: /verify-email ohne JavaScript-Fehler (SSR/Hydration)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/verify-email?email=test%40beispiel.de");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
