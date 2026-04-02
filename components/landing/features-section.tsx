import { BookOpen, Calendar, ShoppingCart, Activity } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Rezeptverwaltung & Import",
    description:
      "Speichere deine Lieblingsrezepte an einem Ort und importiere neue Ideen direkt per URL.",
    accent: "from-slate-50 to-white",
    iconClass: "bg-slate-900 text-white",
  },
  {
    icon: Calendar,
    title: "Wochenplanung",
    description:
      "Plane die Woche in Minuten und entscheide einmal, statt jeden Tag neu zu improvisieren.",
    accent: "from-slate-50 to-white",
    iconClass: "bg-slate-900 text-white",
  },
  {
    icon: ShoppingCart,
    title: "Einkaufsliste",
    description:
      "Aus dem Wochenplan wird Einkauf: übersichtlich, praktisch, und du vergisst weniger.",
    accent: "from-slate-50 to-white",
    iconClass: "bg-slate-900 text-white",
  },
  {
    icon: Activity,
    title: "Kalorientracking & Nährwerte",
    description:
      "Behalte Kalorien und Nährwerte im Blick, ohne dass Tracking zur zweiten Vollzeitaufgabe wird.",
    accent: "from-slate-50 to-white",
    iconClass: "bg-slate-900 text-white",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-slate-600">
            Kernfunktionen
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Alles was du brauchst, um Essen planbarer zu machen.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Nicht als lose Sammlung von Features, sondern als durchgehender Produktfluss von
            Rezept bis Einkauf.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${feature.accent} p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1`}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-slate-200" />
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${feature.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
                <div className="mt-6 text-sm font-medium text-slate-800">
                  Weniger Reibung im Alltag
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
