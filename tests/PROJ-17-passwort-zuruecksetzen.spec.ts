import { test, expect } from "@playwright/test";

// E2E Tests für PROJ-17: Passwort Zurücksetzen
// Vollständiger Reset-Flow (E-Mail-Versand) ist nicht automatisierbar ohne E-Mail-Inbox-Zugriff.
// Diese Tests prüfen: UI-Elemente, Formular-Validierung, Error-States.

test.describe("PROJ-17: Passwort Zurücksetzen", () => {
  test.describe("Login-Seite", () => {
    test("AC: 'Passwort vergessen?'-Link ist vorhanden und führt zu /forgot-password", async ({ page }) => {
      await page.goto("/login");
      const link = page.getByRole("link", { name: /passwort vergessen/i });
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });

  test.describe("/forgot-password — UI und Formular", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/forgot-password");
    });

    test("AC: Seite enthält E-Mail-Eingabefeld", async ({ page }) => {
      await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    });

    test("AC: 'Zurück zum Login'-Link ist vorhanden", async ({ page }) => {
      await expect(page.getByRole("link", { name: /zurück zum login/i })).toBeVisible();
    });

    test("AC: 'Reset-Link senden'-Button ist vorhanden", async ({ page }) => {
      await expect(page.getByRole("button", { name: /reset-link senden/i })).toBeVisible();
    });

    test("AC: Formular erfordert gültige E-Mail (HTML-Validierung)", async ({ page }) => {
      // Leeres Formular absenden — Browser-Validierung greift
      const button = page.getByRole("button", { name: /reset-link senden/i });
      await button.click();
      // Input bleibt im Fokus / Form wird nicht abgeschickt
      await expect(page.getByLabel(/e-mail/i)).toBeFocused();
    });

    test("EC: 'Erneut versuchen'-Link erscheint nach Erfolg (Simulation via non-existente E-Mail)", async ({ page }) => {
      // Supabase zeigt bei nicht-existierender E-Mail keine Fehlermeldung (Security Best Practice)
      // Es wird trotzdem eine Erfolgsmeldung gezeigt
      await page.getByLabel(/e-mail/i).fill("nicht-vorhanden@example.com");
      await page.getByRole("button", { name: /reset-link senden/i }).click();
      // Warte auf Antwort
      await expect(page.getByText(/e-mail mit reset-link wurde gesendet/i)).toBeVisible({ timeout: 8000 });
      await expect(page.getByText(/erneut versuchen/i)).toBeVisible();
    });
  });

  test.describe("/update-password — UI und Validierung", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/update-password");
      // Ohne gültige Session → authError State wird angezeigt
    });

    test("AC: Ohne Session wird 'Link abgelaufen'-Fehlermeldung angezeigt", async ({ page }) => {
      await expect(page.getByText(/link abgelaufen/i)).toBeVisible({ timeout: 5000 });
    });

    test("AC: 'Neuen Reset-Link anfordern'-Button verlinkt zu /forgot-password", async ({ page }) => {
      await expect(page.getByText(/link abgelaufen/i)).toBeVisible({ timeout: 5000 });
      const link = page.getByRole("link", { name: /neuen reset-link anfordern/i });
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });

  test.describe("/update-password — Formular-Validierung (mit Session nötig)", () => {
    // Diese Tests können nur mit einer aktiven Recovery-Session durchgeführt werden.
    // Dafür müsste ein echter Reset-Link geklickt werden.
    // → Als manuelle Testfälle dokumentiert.

    test("SKIP: Passwörter stimmen nicht überein → Fehlermeldung (erfordert Recovery-Session)", async ({ page }) => {
      // Dieser Test ist nur mit einer aktiven Recovery-Session testbar.
      // Implementiert in: update-password/page.tsx Zeile 64-67
      // Logik: if (password !== confirmPassword) setError("Die Passwörter stimmen nicht überein.")
      test.skip(true, "Erfordert aktive Recovery-Session via E-Mail-Link");
    });

    test("SKIP: Passwort-Stärke-Anzeige aktualisiert sich beim Tippen (erfordert Recovery-Session)", async ({ page }) => {
      test.skip(true, "Erfordert aktive Recovery-Session via E-Mail-Link");
    });

    test("SKIP: Eye/EyeOff Toggle zeigt/versteckt Passwort (erfordert Recovery-Session)", async ({ page }) => {
      test.skip(true, "Erfordert aktive Recovery-Session via E-Mail-Link");
    });
  });

  test.describe("Sicherheit", () => {
    test("SEC: /update-password zeigt Formular NICHT ohne Session", async ({ page }) => {
      await page.goto("/update-password");
      // Ohne gültige Session kein Passwort-Formular sichtbar
      await expect(page.getByLabel(/neues passwort/i)).not.toBeVisible({ timeout: 5000 });
    });

    test("SEC: /forgot-password ist auch ohne Login erreichbar", async ({ page }) => {
      // Auth-Seiten müssen öffentlich zugänglich sein
      await page.goto("/forgot-password");
      await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    });
  });
});
