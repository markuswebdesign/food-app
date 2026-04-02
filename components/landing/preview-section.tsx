const points = [
  {
    label: "Für Alltags-Menschen",
    text: "Nicht für Ernährungsexperten. Für alle, die einfach besser essen und weniger darüber nachdenken wollen.",
  },
  {
    label: "Kein Perfektionismus nötig",
    text: "Du musst nicht jeden Tag alles tracken. Das System hilft trotzdem — auch wenn du nur ein paar Tage planst.",
  },
  {
    label: "Ohne App-Installation",
    text: "Läuft im Browser auf jedem Gerät. Kein Download, kein Update, kein Abo.",
  },
];

export function PreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-[#EDE8DC]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#7A7060] mb-4">
              Gebaut für den echten Alltag
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-[#1D2D18] leading-tight mb-8">
              Weniger Planungs&shy;stress.<br />
              Mehr Klarheit.
            </h2>
            <div className="space-y-6">
              {points.map((p) => (
                <div key={p.label} className="flex gap-4">
                  <div className="w-px bg-[#B85630] shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#1D2D18] mb-1">{p.label}</p>
                    <p className="text-sm text-[#7A7060] leading-relaxed font-light">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simple stats card */}
          <div className="bg-[#F5EFE0] p-8 border border-[#DDD4BC]">
            <p className="text-xs uppercase tracking-[0.25em] text-[#7A7060] mb-8">
              Dein Logbuch heute
            </p>

            <div className="space-y-4 mb-8">
              {[
                { time: "Frühstück", meal: "Overnight Oats", kcal: "380 kcal" },
                { time: "Mittag", meal: "Linsen-Bowl mit Feta", kcal: "510 kcal" },
                { time: "Snack", meal: "Apfel + Erdnussbutter", kcal: "240 kcal" },
                { time: "Abend", meal: "Hähnchen-Pasta", kcal: "620 kcal" },
              ].map((entry) => (
                <div
                  key={entry.time}
                  className="flex items-center justify-between py-3 border-b border-[#DDD4BC] last:border-0"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#A09880] mb-0.5">
                      {entry.time}
                    </p>
                    <p className="text-sm text-[#1D2D18] font-light">{entry.meal}</p>
                  </div>
                  <span className="text-xs text-[#7A7060] font-medium tabular-nums">
                    {entry.kcal}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs uppercase tracking-widest text-[#7A7060]">Gesamt</span>
              <div className="text-right">
                <span className="font-display text-2xl font-light text-[#1D2D18]">1.750</span>
                <span className="text-xs text-[#7A7060] ml-1">/ 1.850 kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
