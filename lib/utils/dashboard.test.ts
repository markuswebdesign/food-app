import { describe, it, expect } from "vitest";
import {
  toLocalDateString,
  getWeekStart,
  getWeekEnd,
  buildWeekData,
  calcWeekBalance,
} from "./dashboard";

// Helper: create a local-time date without timezone offset issues
function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 12, 0, 0);
}

describe("toLocalDateString", () => {
  it("gibt YYYY-MM-DD in Lokalzeit zurück", () => {
    expect(toLocalDateString(localDate(2026, 4, 1))).toBe("2026-04-01");
  });

  it("padded Monat und Tag korrekt", () => {
    expect(toLocalDateString(localDate(2026, 1, 5))).toBe("2026-01-05");
  });
});

describe("getWeekStart", () => {
  it("gibt Montag für einen Mittwoch zurück", () => {
    const wed = localDate(2026, 4, 1); // Mi, 1. April 2026
    const start = getWeekStart(wed);
    expect(toLocalDateString(start)).toBe("2026-03-30"); // Mo
  });

  it("gibt Montag für einen Montag zurück (unveränderlich)", () => {
    const mon = localDate(2026, 3, 30);
    expect(toLocalDateString(getWeekStart(mon))).toBe("2026-03-30");
  });

  it("gibt Montag für einen Sonntag zurück", () => {
    const sun = localDate(2026, 4, 5); // So
    expect(toLocalDateString(getWeekStart(sun))).toBe("2026-03-30");
  });
});

describe("getWeekEnd", () => {
  it("gibt Sonntag für Mittwoch zurück", () => {
    const wed = localDate(2026, 4, 1);
    const end = getWeekEnd(wed);
    expect(toLocalDateString(end)).toBe("2026-04-05");
  });

  it("gibt Sonntag für Montag zurück", () => {
    const mon = localDate(2026, 3, 30);
    expect(toLocalDateString(getWeekEnd(mon))).toBe("2026-04-05");
  });
});

describe("buildWeekData", () => {
  const wednesday = localDate(2026, 4, 1); // 2026-04-01 is a Wednesday
  const goal = 1800;

  const logByDate: Record<string, number> = {
    "2026-03-30": 1600, // Mo — Defizit
    "2026-03-31": 2000, // Di — Überschuss
    "2026-04-01": 1400, // Mi (heute) — Defizit
    // Do–So: keine Einträge
  };

  const days = buildWeekData(wednesday, logByDate, goal);

  it("gibt immer 7 Tage zurück", () => {
    expect(days).toHaveLength(7);
  });

  it("Labels sind Mo–So", () => {
    expect(days.map((d) => d.label)).toEqual(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]);
  });

  it("Montag hat consumed=1600", () => {
    expect(days[0].consumed).toBe(1600);
  });

  it("Dienstag hat consumed=2000", () => {
    expect(days[1].consumed).toBe(2000);
  });

  it("Mittwoch (heute) hat consumed=1400 und isToday=true", () => {
    expect(days[2].consumed).toBe(1400);
    expect(days[2].isToday).toBe(true);
  });

  it("Donnerstag hat consumed=null (keine Einträge)", () => {
    expect(days[3].consumed).toBeNull();
  });

  it("Sonntag ist Zukunft (isPast=false, isToday=false)", () => {
    expect(days[6].isPast).toBe(false);
    expect(days[6].isToday).toBe(false);
  });

  it("Montag ist Vergangenheit (isPast=true)", () => {
    expect(days[0].isPast).toBe(true);
  });

  it("alle Tage haben das gegebene Ziel", () => {
    expect(days.every((d) => d.goal === goal)).toBe(true);
  });
});

describe("calcWeekBalance", () => {
  const goal = 1800;
  const wednesday = localDate(2026, 4, 1);

  it("summiert nur vergangene und heutige Tage mit Einträgen", () => {
    const logByDate = {
      "2026-03-30": 1300, // Mo: +500 Defizit
      "2026-04-01": 1600, // Mi: +200 Defizit
      // Di, Do–So: keine Einträge
    };
    const days = buildWeekData(wednesday, logByDate, goal);
    const balance = calcWeekBalance(days);
    expect(balance).toBe(700); // 500 + 200
  });

  it("zählt Überschuss als negativ", () => {
    const logByDate = {
      "2026-03-30": 2100, // Mo: -300 Überschuss
    };
    const days = buildWeekData(wednesday, logByDate, goal);
    const balance = calcWeekBalance(days);
    expect(balance).toBe(-300);
  });

  it("ignoriert Zukunftstage auch wenn Einträge vorhanden wären", () => {
    const logByDate = {
      "2026-04-02": 1000, // Do — Zukunft
    };
    const days = buildWeekData(wednesday, logByDate, goal);
    const balance = calcWeekBalance(days);
    expect(balance).toBe(0);
  });

  it("gibt 0 zurück wenn keine Einträge vorhanden", () => {
    const days = buildWeekData(wednesday, {}, goal);
    expect(calcWeekBalance(days)).toBe(0);
  });
});
