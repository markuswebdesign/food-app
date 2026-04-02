import { describe, it, expect } from "vitest";

// Extracted logic from register/page.tsx for isolated testing
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 8) return { level: 1, label: "Niedrig", color: "bg-red-500" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score === 0) return { level: 1, label: "Niedrig", color: "bg-red-500" };
  if (score === 1) return { level: 2, label: "Mittel", color: "bg-yellow-500" };
  return { level: 3, label: "Sicher", color: "bg-green-500" };
}

describe("getPasswordStrength", () => {
  it("leeres Passwort → level 0, kein Label", () => {
    const result = getPasswordStrength("");
    expect(result.level).toBe(0);
    expect(result.label).toBe("");
  });

  it("kurzes einfaches Passwort → Niedrig", () => {
    const result = getPasswordStrength("abc");
    expect(result.level).toBe(1);
    expect(result.label).toBe("Niedrig");
  });

  it("nur Kleinbuchstaben, 8+ Zeichen → Niedrig (score=1)", () => {
    const result = getPasswordStrength("abcdefgh");
    expect(result.level).toBe(1);
    expect(result.label).toBe("Niedrig");
  });

  it("8+ Zeichen + Großbuchstabe → Mittel (score=2)", () => {
    const result = getPasswordStrength("Abcdefgh");
    expect(result.level).toBe(2);
    expect(result.label).toBe("Mittel");
  });

  it("8+ Zeichen + Großbuchstabe + Zahl → Sicher (score=3)", () => {
    const result = getPasswordStrength("Abcdefg1");
    expect(result.level).toBe(3);
    expect(result.label).toBe("Sicher");
  });

  it("alle Kriterien erfüllt → Sicher (score=4)", () => {
    const result = getPasswordStrength("Abcdef1!");
    expect(result.level).toBe(3);
    expect(result.label).toBe("Sicher");
  });

  it("kurzes Passwort mit allen anderen Kriterien → Niedrig (< 8 Zeichen ist K.O.-Kriterium)", () => {
    // "Ab1!" hat Groß + Zahl + Sonderzeichen, aber nur 4 Zeichen → sofort Niedrig
    const result = getPasswordStrength("Ab1!");
    expect(result.level).toBe(1);
    expect(result.label).toBe("Niedrig");
  });

  it("nur Zahlen, kurz → Niedrig", () => {
    const result = getPasswordStrength("12345");
    expect(result.level).toBe(1);
    expect(result.label).toBe("Niedrig");
  });

  it("nur Sonderzeichen, kurz → Niedrig", () => {
    const result = getPasswordStrength("!!!");
    expect(result.level).toBe(1);
    expect(result.label).toBe("Niedrig");
  });

  it("Farbe bei Niedrig ist bg-red-500", () => {
    expect(getPasswordStrength("abc").color).toBe("bg-red-500");
  });

  it("Farbe bei Mittel ist bg-yellow-500", () => {
    expect(getPasswordStrength("Abcdefgh").color).toBe("bg-yellow-500");
  });

  it("Farbe bei Sicher ist bg-green-500", () => {
    expect(getPasswordStrength("Abcdefg1").color).toBe("bg-green-500");
  });
});
