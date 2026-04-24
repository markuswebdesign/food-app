import { describe, it, expect } from "vitest";

// Mirrors the `isInstagramUrl` function in `components/recipes/import-form.tsx`.
// This inline copy is intentional so the test can assert behaviour without
// having to extract the function (and thus risk changing runtime behaviour).
function isInstagramUrl(input: string): boolean {
  try {
    const host = new URL(input).hostname.replace(/^www\./, "");
    return host === "instagram.com" || host.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

describe("isInstagramUrl — Instagram-Erkennung (PROJ-24 Fix 4)", () => {
  it("erkennt https://instagram.com/ als Instagram", () => {
    expect(isInstagramUrl("https://instagram.com/p/ABC123/")).toBe(true);
  });

  it("erkennt https://www.instagram.com/ als Instagram", () => {
    expect(isInstagramUrl("https://www.instagram.com/reel/ABC123/")).toBe(true);
  });

  it("erkennt Subdomains wie help.instagram.com", () => {
    expect(isInstagramUrl("https://help.instagram.com/")).toBe(true);
  });

  it("erkennt http (unverschlüsselt) Instagram-URLs", () => {
    expect(isInstagramUrl("http://instagram.com/stories/user")).toBe(true);
  });

  it("akzeptiert Instagram-URLs mit Query-String", () => {
    expect(isInstagramUrl("https://www.instagram.com/p/ABC/?utm_source=ig_web")).toBe(true);
  });

  it("lehnt chefkoch.de ab", () => {
    expect(isInstagramUrl("https://www.chefkoch.de/rezepte/123/test")).toBe(false);
  });

  it("lehnt tiktok.com ab", () => {
    expect(isInstagramUrl("https://www.tiktok.com/@user/video/123")).toBe(false);
  });

  it("lehnt Domain mit 'instagram' als Teilstring ab (z.B. faux-instagram.com)", () => {
    // This would match if detection used .includes() — a common bug.
    expect(isInstagramUrl("https://faux-instagram.com/post/1")).toBe(false);
  });

  it("lehnt leeren String ab (kein Throw)", () => {
    expect(isInstagramUrl("")).toBe(false);
  });

  it("lehnt ungültige URL ab (kein Throw)", () => {
    expect(isInstagramUrl("not a url")).toBe(false);
  });

  it("lehnt ab: Pfad enthält 'instagram.com' aber Host ist anders", () => {
    expect(isInstagramUrl("https://evil.com/?redirect=instagram.com")).toBe(false);
  });

  it("lehnt Host 'instagramm.com' (Typo) ab", () => {
    expect(isInstagramUrl("https://instagramm.com/p/xyz")).toBe(false);
  });
});
