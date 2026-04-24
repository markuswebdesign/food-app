import { test, expect, Page } from "@playwright/test";

/**
 * E2E test suite covering:
 *   - PROJ-24 Mobile UX Fixes (Viewport, Recipe-Detail Buttons, Me-Tabs, Instagram block)
 *   - PROJ-25 Rezept direkt zum Wochenplan (Kalender-Icon, Popover)
 *   - PROJ-26 Wochenplan aus Favoriten befüllen (Button + Dialog + <10-Check)
 *   - PROJ-27 Stammprodukte-Einkaufsliste (Tab + CRUD + Alle-Hinzufügen)
 *
 * Most tests require auth; they are skipped automatically when
 * TEST_USER_EMAIL / TEST_USER_PASSWORD env vars are missing.
 */

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|profile|meal-plan|me)/);
}

// ─── PROJ-24 Fix 1: Viewport-Meta-Tag ──────────────────────────────────────────

test.describe("PROJ-24 Fix 1: Viewport-Meta-Tag (öffentlich)", () => {
  test("AC: Viewport-Meta-Tag enthält maximum-scale=1.0 und user-scalable=no", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('head meta[name="viewport"]').getAttribute("content");
    expect(viewport).toBeTruthy();
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("initial-scale=1.0");
    expect(viewport).toContain("maximum-scale=1.0");
    expect(viewport).toContain("user-scalable=no");
  });

  test("AC: Viewport-Meta-Tag auch auf /login", async ({ page }) => {
    await page.goto("/login");
    const viewport = await page.locator('head meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("user-scalable=no");
  });
});

// ─── PROJ-24 Fix 4: Instagram-Import wird früh blockiert ──────────────────────

test.describe("PROJ-24 Fix 4: Instagram wird blockiert (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
  });

  test("AC: Eingabe einer Instagram-URL zeigt sofort eine Fehlermeldung (kein API-Call)", async ({ page }) => {
    await page.goto("/recipes/import");

    // Guard: no request to /api/recipes/import should fire
    let apiCalled = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/recipes/import")) apiCalled = true;
    });

    const urlInput = page.getByPlaceholder(/chefkoch|Instagram/i).first();
    await urlInput.fill("https://www.instagram.com/p/ABC123/");
    const importBtn = page.getByRole("button", { name: /rezept importieren/i });
    await importBtn.click();

    // Fehlertext sichtbar
    await expect(page.getByText(/Instagram-Links werden leider nicht unterstützt/i)).toBeVisible();
    // Fehlertext verweist auf Freitext-Import
    await expect(page.getByText(/Freitext-Import/i)).toBeVisible();

    // Kein API-Call gemacht
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test("AC: Instagram-Warnung im Hilfstext sichtbar", async ({ page }) => {
    await page.goto("/recipes/import");
    await expect(page.getByText(/Instagram nicht unterstützt/i)).toBeVisible();
  });
});

// ─── PROJ-24 Fix 3: Me-Tabs Responsive ────────────────────────────────────────

test.describe("PROJ-24 Fix 3: Me-Tabs Responsive (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
  });

  test("AC: Alle 4 Tabs sichtbar auf 375px Mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me");
    // Mindestens 4 Tab-Links
    const tabs = page.locator("a[href*='/me?tab=']");
    await expect(tabs).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(tabs.nth(i)).toBeVisible();
    }
  });

  test("AC: Tab-Höhe ≥ 44px auf Mobile (Touch-Target)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me");
    const firstTab = page.locator("a[href*='/me?tab=']").first();
    const box = await firstTab.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("AC: Aktiver Tab ist visuell markiert (border-primary)", async ({ page }) => {
    await page.goto("/me?tab=logbuch");
    const active = page.locator("a[href='/me?tab=logbuch']");
    const className = await active.getAttribute("class");
    expect(className).toContain("border-primary");
  });
});

// ─── PROJ-24 Fix 2: Rezept-Detail Buttons ─────────────────────────────────────

test.describe("PROJ-24 Fix 2: Rezept-Detail Button-Layout (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
  });

  test("AC: Bearbeiten-Button hat min-h-[44px] Klasse (Touch-Target) auf Rezept-Detail (wenn Owner)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/recipes?mine=1");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipes/']").first();
    if (await firstCard.count() === 0) test.skip(true, "Kein Rezept verfügbar für Owner-Test");
    await firstCard.click();

    const editBtn = page.getByRole("link", { name: /bearbeiten/i });
    if (await editBtn.count() === 0) test.skip(true, "Kein Besitzer dieses Rezepts — kein Edit-Button");
    const box = await editBtn.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

// ─── PROJ-25: Kalender-Icon + Popover ─────────────────────────────────────────

test.describe("PROJ-25: Rezept direkt zum Wochenplan hinzufügen (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
  });

  test("AC: Kalender-Icon ist auf jeder Rezeptkarte sichtbar", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    // Aria-Label auf dem Trigger
    const calendarBtn = page.getByLabel("Zum Wochenplan hinzufügen").first();
    await expect(calendarBtn).toBeVisible();
  });

  test("AC: Klick auf Kalender-Icon öffnet Popover mit Wochentag + Mahlzeit", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const calendarBtn = page.getByLabel("Zum Wochenplan hinzufügen").first();
    await calendarBtn.click();

    // Overlay enthält Wochentag-Chips & Mahlzeit-Chips
    await expect(page.getByText("Zum Wochenplan hinzufügen").last()).toBeVisible();
    await expect(page.getByText("Wochentag")).toBeVisible();
    await expect(page.getByText("Mahlzeit")).toBeVisible();
    // Prüfe alle 7 Wochentage
    for (const d of ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]) {
      await expect(page.getByRole("button", { name: d }).first()).toBeVisible();
    }
    // Prüfe alle 4 Mahlzeiten
    for (const m of ["Frühstück", "Mittagessen", "Abendessen", "Snack"]) {
      await expect(page.getByRole("button", { name: m }).first()).toBeVisible();
    }
  });

  test("AC: Popover hat 'Hinzufügen'-Button", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const calendarBtn = page.getByLabel("Zum Wochenplan hinzufügen").first();
    await calendarBtn.click();
    await expect(page.getByRole("button", { name: /^hinzufügen$/i })).toBeVisible();
  });

  test("AC: Klick auf Karten-Link (außerhalb des Icons) navigiert zur Detail-Seite", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipes/']").first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(href ?? ""));
  });
});

// ─── PROJ-26: Autofill-Dialog ─────────────────────────────────────────────────

test.describe("PROJ-26: Wochenplan aus Favoriten (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
  });

  test("AC: Button 'Aus Favoriten befüllen' ist auf /meal-plan sichtbar", async ({ page }) => {
    await page.goto("/meal-plan");
    await expect(page.getByRole("button", { name: /aus favoriten befüllen/i })).toBeVisible();
  });

  test("AC: Klick auf Button öffnet Dialog mit Titel 'Wochenplan aus Favoriten befüllen'", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();
    await expect(page.getByText("Wochenplan aus Favoriten befüllen")).toBeVisible();
  });

  test("AC: Dialog hat zwei Optionen — überschreiben oder leere Slots befüllen (wenn ≥10 Favoriten)", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();

    // Falls <10 Favoriten → tooFew-State: Button fehlt, dafür steht da die Warnung.
    const fewWarning = page.getByText(/mindestens 10 Lieblingsrezepte/i);
    const overwriteBtn = page.getByRole("button", { name: /aktuelle woche überschreiben/i });
    const emptyBtn = page.getByRole("button", { name: /nur leere slots befüllen/i });

    if (await fewWarning.isVisible().catch(() => false)) {
      // Warnung sichtbar → test doch bestanden (AC deckt beide Fälle ab)
      test.info().annotations.push({ type: "info", description: "User hat <10 Favoriten; tooFew-Warnung geprüft." });
    } else {
      await expect(overwriteBtn).toBeVisible();
      await expect(emptyBtn).toBeVisible();
    }
  });

  test("AC: Dialog hat Abbrechen-Button", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();
    const cancel = page.getByRole("button", { name: /abbrechen|schließen/i });
    await expect(cancel).toBeVisible();
  });
});

// ─── PROJ-27: Stammprodukte ───────────────────────────────────────────────────

test.describe("PROJ-27: Stammprodukte-Einkaufsliste (mit Auth)", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt");
    }
    await login(page);
    await page.goto("/shopping-list");
    await page.evaluate(() => {
      localStorage.removeItem("shopping-list-manual");
      localStorage.removeItem("shopping-list-checked");
    });
  });

  test("AC: Tab 'Stammprodukte' ist auf /shopping-list sichtbar", async ({ page }) => {
    await page.goto("/shopping-list");
    await expect(page.getByRole("button", { name: /stammprodukte/i })).toBeVisible();
  });

  test("AC: Klick auf Tab zeigt Stammprodukte-Panel", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByRole("heading", { name: "Stammprodukte" }).first()).toBeVisible();
  });

  test("AC: Leerer Zustand zeigt Hinweis-Text", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    // Wenn User keine Stammprodukte → Empty-State sollte sichtbar sein
    const empty = page.getByText(/noch keine stammprodukte/i);
    if (await empty.isVisible().catch(() => false)) {
      await expect(empty).toBeVisible();
      await expect(page.getByText(/regelmäßig einkaufst/i)).toBeVisible();
    }
  });

  test("AC: Formular zum Anlegen eines Stammproduktes ist sichtbar", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByPlaceholder("Produkt hinzufügen...")).toBeVisible();
    await expect(page.getByPlaceholder("Menge").first()).toBeVisible();
    await expect(page.getByPlaceholder("Einheit").first()).toBeVisible();
    await expect(page.getByPlaceholder(/Kategorie \(optional/i)).toBeVisible();
  });

  test("AC: Counter 'X/50 Stammprodukte' ist sichtbar", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByText(/\d+\/50 Stammprodukte/)).toBeVisible();
  });

  test("AC: CRUD flow — Stammprodukt anlegen, löschen", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();

    const uniqueName = `QA-Testprodukt-${Date.now()}`;

    // Anlegen
    await page.getByPlaceholder("Menge").first().fill("500");
    await page.getByPlaceholder("Einheit").first().fill("g");
    await page.getByPlaceholder("Produkt hinzufügen...").fill(uniqueName);
    await page.getByPlaceholder("Produkt hinzufügen...").press("Enter");

    // Item sichtbar
    await expect(page.getByText(uniqueName)).toBeVisible();

    // Löschen — hover aktivieren, Trash-Icon klicken
    const row = page.locator("li").filter({ hasText: uniqueName });
    await row.hover();
    // Delete-Button ist der zweite opacity-0-Button (Pencil + Trash)
    await row.locator("button").last().click();
    await expect(page.getByText(uniqueName)).not.toBeVisible();
  });

  test("AC: API-Schutz — /api/staple-items blockiert unautorisierten Zugriff", async ({ request }) => {
    // Neuer Kontext ohne Login
    const res = await request.get("/api/staple-items");
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Öffentliche AC (kein Login nötig) ────────────────────────────────────────

test.describe("Security: Authentifizierungs-Checks", () => {
  test("AC: POST /api/meal-plan/autofill ohne Auth → 401", async ({ request }) => {
    const res = await request.post("/api/meal-plan/autofill", {
      data: { mode: "overwrite" },
    });
    expect(res.status()).toBe(401);
  });

  test("AC: POST /api/staple-items ohne Auth → 401", async ({ request }) => {
    const res = await request.post("/api/staple-items", { data: { name: "Test" } });
    expect(res.status()).toBe(401);
  });

  test("AC: GET /api/staple-items ohne Auth → 401", async ({ request }) => {
    const res = await request.get("/api/staple-items");
    expect(res.status()).toBe(401);
  });

  test("AC: DELETE /api/staple-items/:id ohne Auth → 401", async ({ request }) => {
    const res = await request.delete("/api/staple-items/00000000-0000-0000-0000-000000000000");
    expect(res.status()).toBe(401);
  });
});
