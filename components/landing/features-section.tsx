const features = [
  {
    num: "01",
    title: "Rezeptverwaltung",
    description:
      "Deine eigene Sammlung — ohne Bookmark-Chaos. Rezepte speichern, importieren und wiederfinden, wenn du sie brauchst.",
  },
  {
    num: "02",
    title: "Wochenplanung",
    description:
      "Einmal planen, die ganze Woche entspannter. Drag-and-drop, Rezepte zuordnen, fertig. Kein tägliches Neu-entscheiden.",
  },
  {
    num: "03",
    title: "Automatische Einkaufsliste",
    description:
      "Aus deinem Wochenplan wird eine geordnete Einkaufsliste. Du vergisst nichts, kaufst nichts doppelt.",
  },
  {
    num: "04",
    title: "Kalorien & Nährwerte",
    description:
      "Tracking, das nicht zur zweiten Arbeit wird. Kalorien, Protein, Fett, Kohlenhydrate — immer im Blick, nie überwältigend.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-[#1D2D18]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-12 pb-6 border-b border-[#F5EFE0]/10">
          <h2 className="font-display text-3xl md:text-4xl font-light text-[#F5EFE0]">
            Was dich erwartet
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-[#F5EFE0]/30 hidden md:block">
            Funktionen
          </span>
        </div>

        {/* Feature list */}
        <div>
          {features.map((f, i) => (
            <div
              key={f.num}
              className={`grid md:grid-cols-[80px_1fr_1fr] gap-4 md:gap-8 py-7 ${
                i < features.length - 1 ? "border-b border-[#F5EFE0]/10" : ""
              }`}
            >
              <span className="font-display text-4xl font-light text-[#B85630]/50 leading-none">
                {f.num}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-light text-[#F5EFE0] self-center">
                {f.title}
              </h3>
              <p className="text-sm text-[#F5EFE0]/50 leading-relaxed self-center font-light">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
