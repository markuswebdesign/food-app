import { CheckCircle2, ShoppingBasket, Sparkles, UtensilsCrossed } from "lucide-react";

const highlights = [
  {
    icon: UtensilsCrossed,
    title: "Rezepte, die nicht im Chaos enden",
    description:
      "Sammeln, ordnen, wiederfinden: damit gute Ideen nicht nach zwei Wochen verschwinden.",
  },
  {
    icon: ShoppingBasket,
    title: "Wochenplanung mit echtem Alltagsnutzen",
    description:
      "Einmal planen, dann leichter durch die Woche kommen, inklusive Einkauf als nächster Schritt.",
  },
  {
    icon: Sparkles,
    title: "Kalorien und Makros ohne Tabellenfrust",
    description:
      "Dein Ziel bleibt sichtbar, ohne ständiges Hin-und-Her zwischen Notizen, Apps und Kopfkino.",
  },
];

const checklist = [
  "klare Wochenstruktur statt täglicher Essensentscheidung",
  "ein zentraler Ort für Rezepte, Planung und Tracking",
  "schneller Einstieg auch ohne komplizierte Einrichtung",
];

export function PreviewSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)]" />

      <div className="container max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm">
              Für Menschen, die gesünder essen wollen, ohne Overhead
            </div>

            <div className="space-y-4">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Weniger Planungsstress, mehr Klarheit in deiner Ernährung.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                FoodApp verbindet Rezeptverwaltung, Wochenplanung und Tracking so, dass aus
                guten Vorsätzen eine Routine wird. Nicht steril, sondern praktisch.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-amber-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(15,23,42,0.10),rgba(13,148,136,0.07),rgba(255,255,255,0.0))] blur-2xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Diese Woche
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Ein ruhiger Ernährungs-Flow</h3>
                </div>
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-right text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Ziel</p>
                  <p className="text-lg font-semibold">1.850 kcal</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Wochenplan aktiv</p>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                      5 Tage vorbereitet
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="font-semibold text-slate-900">Mo</p>
                      <p>Overnight Oats</p>
                      <p>Linsen-Bowl</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-3">
                      <p className="font-semibold text-slate-900">Di</p>
                      <p>Protein-Pasta</p>
                      <p>Gemüse-Curry</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Was sich dadurch verbessert</p>
                  <div className="space-y-3">
                    {checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/75 p-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                        <p className="text-sm text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
