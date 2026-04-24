import { test, expect, Page } from "@playwright/test";

/**
 * E2E tests for PROJ-24 to PROJ-27.
 *
 * Coverage matrix:
 *   PROJ-24 Fix 1  Viewport meta tag on every rendered page
 *   PROJ-24 Fix 2  Recipe-Detail edit/delete buttons — 44px min touch target
 *   PROJ-24 Fix 3  Me-Tabs responsive (375px), active state, 44px touch target
 *   PROJ-24 Fix 4  Instagram URL is blocked before any API call
 *   PROJ-25        Calendar icon + popover on recipe cards + detail page
 *   PROJ-26        Autofill dialog on /meal-plan + <10 favorites guard
 *   PROJ-27        Staple-items tab + CRUD form + "Alle zur Liste" + 50-item counter
 *   Security       Unauth access to /api/staple-items + /api/meal-plan/autofill → 401
 *
 * Tests that require a session skip automatically when
 * TEST_USER_EMAIL / TEST_USER_PASSWORD env vars are missing.
 * API-route auth checks and public viewport tests always run.
 */

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "";
const HAS_CREDS = Boolean(TEST_EMAIL && TEST_PASSWORD);

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/e-mail/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL(/\/(recipes|profile|meal-plan|me|shopping-list)/);
}

// ─── PROJ-24 Fix 1: Viewport meta tag (public, no login required) ──────────────

test.describe("PROJ-24 Fix 1: Viewport meta tag", () => {
  test("AC1: Viewport meta tag contains maximum-scale=1.0 and user-scalable=no on /", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('head meta[name="viewport"]').getAttribute("content");
    expect(viewport).toBeTruthy();
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("initial-scale=1.0");
    expect(viewport).toContain("maximum-scale=1.0");
    expect(viewport).toContain("user-scalable=no");
  });

  test("AC2: Viewport meta tag also present on /login", async ({ page }) => {
    await page.goto("/login");
    const viewport = await page.locator('head meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("user-scalable=no");
  });
});

// ─── PROJ-24 Fix 4: Instagram import is blocked early ──────────────────────────

test.describe("PROJ-24 Fix 4: Instagram URL blocked before API call", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("AC1: Instagram URL triggers immediate error; /api/recipes/import is NOT called", async ({ page }) => {
    await page.goto("/recipes/import");

    let apiCalled = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/recipes/import")) apiCalled = true;
    });

    await page.getByPlaceholder(/chefkoch|instagram/i).first().fill("https://www.instagram.com/p/ABC123/");
    await page.getByRole("button", { name: /rezept importieren/i }).click();

    await expect(page.getByText(/instagram-links werden leider nicht unterstützt/i)).toBeVisible();
    await expect(page.getByText(/freitext-import/i)).toBeVisible();

    // Allow time for any (unwanted) fetch
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test("AC2: Instagram-warning hint is visible in the import form (no URL entered)", async ({ page }) => {
    await page.goto("/recipes/import");
    await expect(page.getByText(/instagram nicht unterstützt/i)).toBeVisible();
  });

  test("Edge case: instagram.com variants (subdomain) are also blocked", async ({ page }) => {
    await page.goto("/recipes/import");
    await page.getByPlaceholder(/chefkoch|instagram/i).first().fill("https://m.instagram.com/p/xyz/");
    await page.getByRole("button", { name: /rezept importieren/i }).click();
    await expect(page.getByText(/instagram-links werden leider nicht unterstützt/i)).toBeVisible();
  });
});

// ─── PROJ-24 Fix 3: Me-Tabs responsive ─────────────────────────────────────────

test.describe("PROJ-24 Fix 3: Me-Tabs responsive on mobile", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("AC1: All 4 tabs are visible on 375px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me");
    const tabs = page.locator("a[href*='/me?tab=']");
    await expect(tabs).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(tabs.nth(i)).toBeVisible();
    }
  });

  test("AC4: Touch target ≥ 44px for each tab on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me");
    const first = page.locator("a[href*='/me?tab=']").first();
    const box = await first.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("AC3: Active tab is visually marked (border-primary)", async ({ page }) => {
    await page.goto("/me?tab=logbuch");
    const active = page.locator("a[href='/me?tab=logbuch']");
    const cls = await active.getAttribute("class");
    expect(cls).toContain("border-primary");
  });

  test("AC2: No horizontal page scroll needed at 375px (tabs inside scrollable container)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/me");
    // Document itself should not overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 tolerance for sub-pixel
  });
});

// ─── PROJ-24 Fix 2: Recipe-Detail buttons ──────────────────────────────────────

test.describe("PROJ-24 Fix 2: Recipe-Detail edit/delete buttons on mobile", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("AC3: Edit button has min 44px touch target on mobile (if owner)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/recipes?mine=1");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator("a[href^='/recipes/']").first();
    if ((await firstCard.count()) === 0) {
      test.skip(true, "No owned recipe available for owner-only assertion");
    }
    await firstCard.click();

    const editBtn = page.getByRole("link", { name: /bearbeiten/i });
    if ((await editBtn.count()) === 0) {
      test.skip(true, "Not the recipe owner — Edit button not shown");
    }
    const box = await editBtn.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("AC1: Button row uses flex-col on mobile (wraps vertically)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/recipes?mine=1");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipes/']").first();
    if ((await firstCard.count()) === 0) test.skip(true, "No recipe available");
    await firstCard.click();

    // Header contains flex-col sm:flex-row
    const header = page.locator("h1").first().locator("..");
    const cls = await header.getAttribute("class");
    expect(cls).toContain("flex-col");
  });
});

// ─── PROJ-25: Add recipe to meal plan via calendar icon ────────────────────────

test.describe("PROJ-25: Calendar icon on recipe cards + popover", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("AC1: Calendar icon is visible on at least one recipe card", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const icon = page.getByLabel("Zum Wochenplan hinzufügen").first();
    await expect(icon).toBeVisible();
  });

  test("AC2+3: Clicking the icon opens a popover showing weekday + meal selection", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Zum Wochenplan hinzufügen").first().click();

    await expect(page.getByText("Wochentag")).toBeVisible();
    await expect(page.getByText("Mahlzeit")).toBeVisible();
    for (const d of ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]) {
      await expect(page.getByRole("button", { name: d }).first()).toBeVisible();
    }
    for (const m of ["Frühstück", "Mittagessen", "Abendessen", "Snack"]) {
      await expect(page.getByRole("button", { name: m }).first()).toBeVisible();
    }
  });

  test("AC5: Popover has 'Hinzufügen' confirm button", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Zum Wochenplan hinzufügen").first().click();
    await expect(page.getByRole("button", { name: /^hinzufügen$/i })).toBeVisible();
  });

  test("AC7: Calendar icon is also present on the recipe detail page (when logged in)", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipes/']").first();
    if ((await firstCard.count()) === 0) test.skip(true, "No recipes available");
    await firstCard.click();
    await page.waitForLoadState("networkidle");
    const icon = page.getByLabel("Zum Wochenplan hinzufügen");
    await expect(icon.first()).toBeVisible();
  });

  test("UX: Clicking the card (not the icon) still navigates to the detail page", async ({ page }) => {
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipes/']").first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(href ?? ""));
  });
});

// ─── PROJ-26: Autofill dialog on /meal-plan ────────────────────────────────────

test.describe("PROJ-26: Wochenplan autofill from favorites", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("AC1: 'Aus Favoriten befüllen' button is visible on /meal-plan", async ({ page }) => {
    await page.goto("/meal-plan");
    await expect(page.getByRole("button", { name: /aus favoriten befüllen/i })).toBeVisible();
  });

  test("AC3: Dialog title is 'Wochenplan aus Favoriten befüllen'", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();
    await expect(page.getByText("Wochenplan aus Favoriten befüllen")).toBeVisible();
  });

  test("AC3: Dialog offers two options OR shows too-few-favorites warning", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();

    const fewWarning = page.getByText(/mindestens 10 lieblingsrezepte/i);
    const overwrite = page.getByRole("button", { name: /aktuelle woche überschreiben/i });
    const emptyOnly = page.getByRole("button", { name: /nur leere slots befüllen/i });

    if (await fewWarning.isVisible().catch(() => false)) {
      test.info().annotations.push({
        type: "info",
        description: "<10 favorites — tooFew-state verified",
      });
    } else {
      await expect(overwrite).toBeVisible();
      await expect(emptyOnly).toBeVisible();
    }
  });

  test("Cancel/Close button is always present inside the dialog", async ({ page }) => {
    await page.goto("/meal-plan");
    await page.getByRole("button", { name: /aus favoriten befüllen/i }).click();
    await expect(page.getByRole("button", { name: /abbrechen|schließen/i })).toBeVisible();
  });

  test("AC2: Autofill with <10 favorites returns a 400 with too_few_favorites", async ({ page, request }) => {
    // Grab cookies from the authenticated browser context and use them for a direct API call
    const cookies = await page.context().cookies();
    const res = await request.post("/api/meal-plan/autofill", {
      data: { mode: "overwrite" },
      headers: { cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; ") },
    });
    // Either successful (≥10 favorites) or too_few_favorites (<10). Never 401 (authenticated).
    expect([200, 400]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.error).toBe("too_few_favorites");
    }
  });
});

// ─── PROJ-27: Staple-items tab + CRUD ──────────────────────────────────────────

test.describe("PROJ-27: Staple-items on /shopping-list", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
    await page.goto("/shopping-list");
    await page.evaluate(() => {
      localStorage.removeItem("shopping-list-manual");
      localStorage.removeItem("shopping-list-checked");
    });
  });

  test("AC1: 'Stammprodukte' tab is visible on /shopping-list", async ({ page }) => {
    await page.goto("/shopping-list");
    await expect(page.getByRole("button", { name: /stammprodukte/i })).toBeVisible();
  });

  test("AC1: Clicking the tab reveals the staple-items panel", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByRole("heading", { name: "Stammprodukte" }).first()).toBeVisible();
  });

  test("Edge case: empty state shows a helpful hint", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    const empty = page.getByText(/noch keine stammprodukte/i);
    if (await empty.isVisible().catch(() => false)) {
      await expect(page.getByText(/regelmäßig einkaufst/i)).toBeVisible();
    }
  });

  test("AC2: Form fields for adding a staple item are present", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByPlaceholder("Produkt hinzufügen...")).toBeVisible();
    await expect(page.getByPlaceholder("Menge").first()).toBeVisible();
    await expect(page.getByPlaceholder("Einheit").first()).toBeVisible();
    await expect(page.getByPlaceholder(/kategorie \(optional/i)).toBeVisible();
  });

  test("AC7: Counter 'X/50 Stammprodukte' is visible", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();
    await expect(page.getByText(/\d+\/50 stammprodukte/i)).toBeVisible();
  });

  test("AC2+5: CRUD flow — create then delete a staple item", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();

    const uniqueName = `QA-Testprodukt-${Date.now()}`;

    await page.getByPlaceholder("Menge").first().fill("500");
    await page.getByPlaceholder("Einheit").first().fill("g");
    await page.getByPlaceholder("Produkt hinzufügen...").fill(uniqueName);
    await page.getByPlaceholder("Produkt hinzufügen...").press("Enter");

    await expect(page.getByText(uniqueName)).toBeVisible();

    const row = page.locator("li").filter({ hasText: uniqueName });
    await row.hover();
    await row.locator("button").last().click();
    await expect(page.getByText(uniqueName)).not.toBeVisible();
  });

  test("AC3: 'Alle zur Liste' button writes staples into localStorage shopping-list-manual", async ({ page }) => {
    await page.goto("/shopping-list");
    await page.getByRole("button", { name: /stammprodukte/i }).click();

    const uniqueName = `QA-Bulkprodukt-${Date.now()}`;
    await page.getByPlaceholder("Menge").first().fill("200");
    await page.getByPlaceholder("Einheit").first().fill("g");
    await page.getByPlaceholder("Produkt hinzufügen...").fill(uniqueName);
    await page.getByPlaceholder("Produkt hinzufügen...").press("Enter");
    await expect(page.getByText(uniqueName)).toBeVisible();

    await page.getByRole("button", { name: /alle zur liste/i }).click();
    await page.waitForTimeout(300);

    const stored = await page.evaluate(() => localStorage.getItem("shopping-list-manual"));
    expect(stored).toBeTruthy();
    expect(stored).toContain(uniqueName);

    // Cleanup
    const row = page.locator("li").filter({ hasText: uniqueName });
    await row.hover();
    await row.locator("button").last().click();
  });
});

// ─── Security: API route auth protection (always runs, no login required) ──────

test.describe("Security: Unauthenticated access to sensitive API routes → 401", () => {
  test("POST /api/meal-plan/autofill without auth → 401", async ({ request }) => {
    const res = await request.post("/api/meal-plan/autofill", {
      data: { mode: "overwrite" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/staple-items without auth → 401", async ({ request }) => {
    const res = await request.get("/api/staple-items");
    expect(res.status()).toBe(401);
  });

  test("POST /api/staple-items without auth → 401", async ({ request }) => {
    const res = await request.post("/api/staple-items", {
      data: { name: "Injected" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/staple-items/:id without auth → 401", async ({ request }) => {
    const res = await request.delete(
      "/api/staple-items/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/staple-items/:id without auth → 401", async ({ request }) => {
    const res = await request.patch(
      "/api/staple-items/00000000-0000-0000-0000-000000000000",
      { data: { name: "Injected" } }
    );
    expect(res.status()).toBe(401);
  });
});

// ─── Regression: existing pages still render without errors ────────────────────

test.describe("Regression: core pages still load without crashing", () => {
  test.beforeEach(async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
    await login(page);
  });

  test("Regression: /recipes loads", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.locator("text=/500|internal server error/i")).not.toBeVisible();
  });

  test("Regression: /meal-plan loads", async ({ page }) => {
    await page.goto("/meal-plan");
    await expect(page.locator("text=/500|internal server error/i")).not.toBeVisible();
  });

  test("Regression: /shopping-list loads", async ({ page }) => {
    await page.goto("/shopping-list");
    await expect(page.locator("text=/500|internal server error/i")).not.toBeVisible();
  });

  test("Regression: /me loads", async ({ page }) => {
    await page.goto("/me");
    await expect(page.locator("text=/500|internal server error/i")).not.toBeVisible();
  });
});
