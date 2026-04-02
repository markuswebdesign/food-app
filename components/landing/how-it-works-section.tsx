import { ArrowRight, BookOpen, Calendar, ShoppingBasket } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    eyebrow: "Schritt 1",
    title: "Rezepte sammeln, die du wirklich kochst",
    description:
      "Speichere eigene Rezepte oder importiere Ideen, die dir gefallen. So entsteht deine persönliche Bibliothek statt ein Bookmark-Friedhof.",
    tone: "from-slate-50 to-white",
    iconTone: "bg-slate-900 text-white",
  },
  {
    icon: Calendar,
    eyebrow: "Schritt 2",
    title: "Woche planen, Entscheidungen reduzieren",
    description:
      "Plane ein paar Tage im Voraus. Du musst nicht perfekt sein, nur vorbereitet genug, damit der Alltag leichter wird.",
    tone: "from-slate-50 to-white",
    iconTone: "bg-slate-900 text-white",
  },
  {
    icon: ShoppingBasket,
    eyebrow: "Schritt 3",
    title: "Einkauf ableiten, dranbleiben",
    description:
      "Aus Planung wird Einkauf. Und aus Einkauf wird Routine. Tracking bleibt dabei im Hintergrund, aber dein Ziel sichtbar.",
    tone: "from-slate-100 via-white to-white",
    iconTone: "bg-slate-900 text-white",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)]" />

      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-slate-600">
            So funktioniert es
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Ein Flow, der dich entlastet.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Nicht mehr Features, sondern weniger Reibung. Drei Schritte, die sich im Alltag bewähren.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className={`relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${step.tone} p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)]`}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-slate-200" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {step.title}
                    </h3>
                  </div>
                  <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${step.iconTone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                  Weiterdenken statt neu anfangen <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
