import { describe, it, expect } from "vitest";
import { calcStreak } from "./streak";

// Helper: local-time date to avoid timezone issues
function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 12, 0, 0);
}

const GOAL = 1800;

describe("calcStreak – Status (lose)", () => {
  it("on_track wenn heute Kalorien ≤ Ziel", () => {
    const result = calcStreak({ "2026-04-01": 1600 }, GOAL, localDate(2026, 4, 1));
    expect(result.status).toBe("on_track");
  });

  it("surplus wenn heute Kalorien > Ziel", () => {
    const result = calcStreak({ "2026-04-01": 2000 }, GOAL, localDate(2026, 4, 1));
    expect(result.status).toBe("surplus");
  });

  it("no_log wenn heute keine Einträge", () => {
    const result = calcStreak({}, GOAL, localDate(2026, 4, 1));
    expect(result.status).toBe("no_log");
  });

  it("genau am Ziel gilt als on_track (Grenzwert)", () => {
    const result = calcStreak({ "2026-04-01": 1800 }, GOAL, localDate(2026, 4, 1));
    expect(result.status).toBe("on_track");
  });
});

describe("calcStreak – Status (maintain ±100 kcal Toleranz)", () => {
  it("on_track_maintain wenn innerhalb ±100 kcal", () => {
    const result = calcStreak({ "2026-04-01": 1850 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.status).toBe("on_track_maintain");
  });

  it("on_track_maintain bei exakt +100 kcal (Grenzwert)", () => {
    const result = calcStreak({ "2026-04-01": 1900 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.status).toBe("on_track_maintain");
  });

  it("on_track_maintain bei exakt -100 kcal (Grenzwert)", () => {
    const result = calcStreak({ "2026-04-01": 1700 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.status).toBe("on_track_maintain");
  });

  it("surplus bei >100 kcal über Ziel", () => {
    const result = calcStreak({ "2026-04-01": 1901 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.status).toBe("surplus");
  });

  it("surplus bei >100 kcal unter Ziel", () => {
    const result = calcStreak({ "2026-04-01": 1699 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.status).toBe("surplus");
  });

  it("Streak zählt bei maintain Toleranz", () => {
    const logs = {
      "2026-03-31": 1850, // +50 kcal — innerhalb Toleranz
      "2026-04-01": 1750, // -50 kcal — innerhalb Toleranz
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.currentStreak).toBe(2);
  });

  it("Streak bricht bei maintain außerhalb Toleranz ab", () => {
    const logs = {
      "2026-03-31": 2000, // +200 kcal — außerhalb
      "2026-04-01": 1800,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.currentStreak).toBe(1);
  });
});

describe("calcStreak – Motivationstext", () => {
  it("'Super, weiter so!' bei on_track (lose)", () => {
    const result = calcStreak({ "2026-04-01": 1600 }, GOAL, localDate(2026, 4, 1), "lose");
    expect(result.motivationText).toBe("Super, weiter so!");
  });

  it("'Du bist auf Kurs' bei on_track_maintain", () => {
    const result = calcStreak({ "2026-04-01": 1820 }, GOAL, localDate(2026, 4, 1), "maintain");
    expect(result.motivationText).toBe("Du bist auf Kurs");
  });

  it("'Morgen ist ein neuer Tag' bei surplus", () => {
    const result = calcStreak({ "2026-04-01": 2200 }, GOAL, localDate(2026, 4, 1));
    expect(result.motivationText).toBe("Morgen ist ein neuer Tag");
  });

  it("'Vergiss nicht zu loggen' bei no_log", () => {
    const result = calcStreak({}, GOAL, localDate(2026, 4, 1));
    expect(result.motivationText).toBe("Vergiss nicht zu loggen");
  });
});

describe("calcStreak – Aktueller Streak", () => {
  it("Streak = 0 wenn keine Logs vorhanden", () => {
    const result = calcStreak({}, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(0);
  });

  it("Streak = 1 wenn nur heute geloggt und on_track", () => {
    const result = calcStreak({ "2026-04-01": 1600 }, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(1);
  });

  it("Streak zählt konsekutive Tage rückwärts", () => {
    const logs = {
      "2026-03-29": 1500,
      "2026-03-30": 1700,
      "2026-03-31": 1600,
      "2026-04-01": 1400,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(4);
  });

  it("Streak bricht bei einer Lücke ab", () => {
    const logs = {
      "2026-03-28": 1500,
      // 2026-03-29 fehlt — Lücke
      "2026-03-30": 1700,
      "2026-03-31": 1600,
      "2026-04-01": 1400,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(3);
  });

  it("Streak bricht bei Überschuss ab", () => {
    const logs = {
      "2026-03-29": 1500,
      "2026-03-30": 2500,
      "2026-03-31": 1600,
      "2026-04-01": 1400,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(2);
  });

  it("Streak zählt historische Tage auch wenn heute kein Log", () => {
    const logs = {
      "2026-03-30": 1700,
      "2026-03-31": 1600,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(2);
    expect(result.status).toBe("no_log");
  });
});

describe("calcStreak – Längster Streak", () => {
  it("longestStreak = currentStreak wenn nur eine Serie vorhanden", () => {
    const logs = {
      "2026-03-31": 1600,
      "2026-04-01": 1400,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.longestStreak).toBe(2);
  });

  it("longestStreak erkennt längere historische Serie und ignoriert Lücken korrekt", () => {
    const logs: Record<string, number> = {};
    // Lange Serie: März 10–14 (5 Tage)
    for (let d = 10; d <= 14; d++) {
      logs[`2026-03-${d}`] = 1500;
    }
    // Lücke 15.–30. März
    // Aktuelle Serie: März 31 + April 1 (2 Tage)
    logs["2026-03-31"] = 1600;
    logs["2026-04-01"] = 1400;

    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(5); // historische Serie korrekt erkannt
  });

  it("longestStreak ignoriert Zukunftstage", () => {
    const logs = {
      "2026-04-01": 1400,
      "2026-04-02": 1200, // morgen — darf nicht zählen
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.longestStreak).toBe(1);
  });
});

describe("calcStreak – Earned Badges", () => {
  it("keine Badges bei Streak < 7", () => {
    const logs = { "2026-04-01": 1400 };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.earnedBadges).toEqual([]);
  });

  it("7-Tage-Badge bei longestStreak ≥ 7", () => {
    const logs: Record<string, number> = {};
    for (let d = 26; d <= 31; d++) logs[`2026-03-${d}`] = 1500;
    logs["2026-04-01"] = 1400;
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.earnedBadges).toContain(7);
  });

  it("14-Tage-Badge bei longestStreak ≥ 14", () => {
    const logs: Record<string, number> = {};
    for (let d = 19; d <= 31; d++) logs[`2026-03-${d}`] = 1500;
    logs["2026-04-01"] = 1400;
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.earnedBadges).toContain(7);
    expect(result.earnedBadges).toContain(14);
  });

  it("30-Tage-Badge bei longestStreak ≥ 30", () => {
    const logs: Record<string, number> = {};
    for (let d = 2; d <= 31; d++) {
      const day = String(d).padStart(2, "0");
      logs[`2026-03-${day}`] = 1500;
    }
    logs["2026-04-01"] = 1400;
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.earnedBadges).toContain(30);
  });
});

describe("calcStreak – Edge Cases", () => {
  it("leere Logs → Streak 0, no_log, keine Badges", () => {
    const result = calcStreak({}, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.status).toBe("no_log");
    expect(result.earnedBadges).toEqual([]);
  });

  it("Zukunftstage werden ignoriert und brechen keinen Streak", () => {
    const logs = {
      "2026-03-31": 1600,
      "2026-04-01": 1400,
      "2026-04-02": 9999,
    };
    const result = calcStreak(logs, GOAL, localDate(2026, 4, 1));
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });
});
