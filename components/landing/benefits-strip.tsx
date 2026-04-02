const benefits = [
  "Rezepte, Wochenplan, Einkauf in einem Flow",
  "Kalorien und Nährwerte im Alltag sichtbar",
  "Mobil und Desktop ohne App-Download",
];

export function BenefitsStrip() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/60">
      <div className="container max-w-6xl px-4 py-4">
        <div className="grid gap-3 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm"
            >
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
