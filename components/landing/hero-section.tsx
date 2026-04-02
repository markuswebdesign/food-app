import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 lg:gap-20 items-center">
          {/* Left: Editorial headline */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#7A7060] mb-6 font-medium">
              Ernährungsroutine ohne Overhead
            </p>

            <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.05] tracking-tight text-[#1D2D18]">
              Essen, das sich
              <br />
              <em className="not-italic text-[#B85630]">endlich</em> wie
              <br />
              eine Routine
              <br />
              anfühlt.
            </h1>

            <p className="mt-8 text-base md:text-lg text-[#7A7060] leading-relaxed max-w-md font-light">
              Rezepte verwalten, die Woche planen, Kalorien im Blick behalten —
              als ein durchgehender Flow, nicht drei separate Tools.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#1D2D18] text-[#F5EFE0] text-sm font-medium px-6 py-3 hover:bg-[#2A3F24] transition-colors"
              >
                Kostenlos starten
                <span>→</span>
              </Link>
              <Link
                href="/login"
                className="text-sm text-[#7A7060] hover:text-[#1D2D18] transition-colors underline underline-offset-4 decoration-[#DDD4BC]"
              >
                Schon ein Konto?
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#A09880]">
              Kein Download · Direkt im Browser · Für immer kostenlos
            </p>
          </div>

          {/* Right: Food journal card */}
          <div className="relative">
            {/* Background accent */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-[#B85630]/8 -z-10" />

            <div className="bg-[#1D2D18] text-[#F5EFE0] p-8 relative overflow-hidden">
              {/* Week header */}
              <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#F5EFE0]/10">
                <span className="font-display text-3xl font-light tracking-tight">
                  Woche 15
                </span>
                <span className="text-xs text-[#F5EFE0]/40 uppercase tracking-widest">
                  Mein Plan
                </span>
              </div>

              {/* Days */}
              {[
                { day: "Mo", meals: ["Overnight Oats", "Linsen-Bowl"] },
                { day: "Di", meals: ["Avocado-Toast", "Hähnchen-Pasta"] },
                { day: "Mi", meals: ["Müsli", "Gemüse-Curry"] },
                { day: "Do", meals: ["Joghurt & Beeren", "Lachsfilet"] },
              ].map((item, i) => (
                <div
                  key={item.day}
                  className={`flex items-start gap-5 py-3 ${
                    i < 3 ? "border-b border-[#F5EFE0]/8" : ""
                  }`}
                >
                  <span className="font-display text-sm font-light text-[#F5EFE0]/40 w-6 shrink-0 mt-0.5">
                    {item.day}
                  </span>
                  <div className="space-y-0.5">
                    {item.meals.map((meal) => (
                      <p key={meal} className="text-sm text-[#F5EFE0]/80 font-light">
                        {meal}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Macro summary strip */}
              <div className="mt-6 pt-4 border-t border-[#F5EFE0]/10 grid grid-cols-3 gap-2">
                {[
                  { label: "Ø Kalorien", val: "1.840" },
                  { label: "Protein", val: "142 g" },
                  { label: "Ziel", val: "✓" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-lg font-light text-[#F5EFE0]">{s.val}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#F5EFE0]/35 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
