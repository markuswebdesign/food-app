import { describe, it, expect } from "vitest";

// Mirrors the `handleAddAllToList` merge logic from
// `components/shopping-list/staple-items-panel.tsx`.
// Extracted for testability without rendering the component.

type StapleItem = {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  category: string | null;
};

type ManualEntry = {
  id: string;
  name: string;
  amount: string;
  unit: string;
};

function mergeStapleIntoManual(
  existing: ManualEntry[],
  staples: StapleItem[],
  newId: () => string = () => "generated-id"
): ManualEntry[] {
  const updated = [...existing];
  for (const item of staples) {
    const nameKey = item.name.toLowerCase().trim();
    const unitKey = (item.unit ?? "").toLowerCase().trim();
    const match = updated.find(
      (e) => e.name.toLowerCase().trim() === nameKey && (e.unit ?? "").toLowerCase().trim() === unitKey
    );
    if (match && item.amount != null) {
      const prev = parseFloat(match.amount) || 0;
      match.amount = String(prev + item.amount);
    } else if (!match) {
      updated.push({
        id: newId(),
        name: item.name,
        amount: item.amount != null ? String(item.amount) : "",
        unit: item.unit ?? "",
      });
    }
  }
  return updated;
}

describe("mergeStapleIntoManual — PROJ-27 Menge-Addition", () => {
  it("fügt neue Stammprodukte zur leeren Liste hinzu", () => {
    const result = mergeStapleIntoManual(
      [],
      [{ id: "s1", name: "Milch", amount: 1, unit: "L", category: null }]
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Milch");
    expect(result[0].amount).toBe("1");
    expect(result[0].unit).toBe("L");
  });

  it("addiert Menge bei Namens- und Einheits-Match", () => {
    const existing: ManualEntry[] = [
      { id: "e1", name: "Butter", amount: "100", unit: "g" },
    ];
    const result = mergeStapleIntoManual(existing, [
      { id: "s1", name: "Butter", amount: 100, unit: "g", category: null },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("200");
  });

  it("Case-Insensitive Matching: BUTTER = butter", () => {
    const existing: ManualEntry[] = [
      { id: "e1", name: "BUTTER", amount: "50", unit: "g" },
    ];
    const result = mergeStapleIntoManual(existing, [
      { id: "s1", name: "butter", amount: 100, unit: "g", category: null },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("150");
  });

  it("behandelt verschiedene Einheiten als separate Items", () => {
    const existing: ManualEntry[] = [
      { id: "e1", name: "Milch", amount: "1", unit: "L" },
    ];
    const result = mergeStapleIntoManual(
      existing,
      [{ id: "s1", name: "Milch", amount: 200, unit: "ml", category: null }],
      () => "new-id"
    );
    expect(result).toHaveLength(2);
  });

  it("Stammprodukt ohne Menge + Match → KEINE Addition (Bug-Regression)", () => {
    // Das ist laut Code-Pfad: match existiert, aber item.amount == null → nichts passiert
    const existing: ManualEntry[] = [
      { id: "e1", name: "Salz", amount: "50", unit: "g" },
    ];
    const result = mergeStapleIntoManual(existing, [
      { id: "s1", name: "Salz", amount: null, unit: "g", category: null },
    ]);
    expect(result).toHaveLength(1);
    // Original-Menge unverändert
    expect(result[0].amount).toBe("50");
  });

  it("Stammprodukt ohne Menge + KEIN Match → als neues Item mit leerer Menge", () => {
    const result = mergeStapleIntoManual(
      [],
      [{ id: "s1", name: "Salz", amount: null, unit: null, category: null }],
      () => "new-id"
    );
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("");
    expect(result[0].unit).toBe("");
  });

  it("Existing mit nicht-numerischer Menge → parseFloat = NaN, 0 + amount", () => {
    const existing: ManualEntry[] = [
      { id: "e1", name: "Reis", amount: "zwei", unit: "kg" },
    ];
    const result = mergeStapleIntoManual(existing, [
      { id: "s1", name: "Reis", amount: 1, unit: "kg", category: null },
    ]);
    expect(result).toHaveLength(1);
    // parseFloat("zwei") = NaN; NaN || 0 = 0; "0 + 1" = "1"
    expect(result[0].amount).toBe("1");
  });

  it("Trim + case-insensitive: ' Milch ' → 'milch'", () => {
    const existing: ManualEntry[] = [
      { id: "e1", name: " Milch ", amount: "1", unit: " L " },
    ];
    const result = mergeStapleIntoManual(existing, [
      { id: "s1", name: "milch", amount: 1, unit: "l", category: null },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("2");
  });

  it("Mehrere Stammprodukte hintereinander addieren sich korrekt auf", () => {
    let counter = 0;
    const result = mergeStapleIntoManual(
      [],
      [
        { id: "s1", name: "Eier", amount: 6, unit: "Stück", category: null },
        { id: "s2", name: "Eier", amount: 4, unit: "Stück", category: null },
      ],
      () => `id-${counter++}`
    );
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("10");
  });
});
