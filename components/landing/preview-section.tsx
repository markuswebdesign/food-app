const stats = [
  { value: "500+", label: "Rezepte in der Datenbank" },
  { value: "100%", label: "Kostenlos für immer" },
  { value: "3-in-1", label: "Rezepte · Planung · Tracking" },
  { value: "5 min", label: "Bis zum ersten Wochenplan" },
];

export function PreviewSection() {
  return (
    <section className="py-20 bg-[#1D2D18]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-5xl md:text-6xl font-normal text-[#D4A853] leading-none mb-3">
                {s.value}
              </p>
              <p className="text-sm text-white/55 uppercase tracking-[0.12em] leading-snug">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
