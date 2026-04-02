import Link from "next/link";
import { ArrowRight, Check, Sparkles, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_55%)]" />

      <div className="container max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              FoodApp: weniger Planungsstress, mehr Routine
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
              Ernährung wird <span className="text-teal-700">planbar</span>, ohne dass es sich wie Arbeit anfühlt.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Speichere Rezepte, plane deine Woche und behalte Kalorien und Nährwerte im Blick.
              Alles greift ineinander, damit du schneller entscheidest und entspannter dranbleibst.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-slate-950 px-7 text-base text-white hover:bg-slate-800"
              >
                <Link href="/register">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-slate-300 bg-white/80 px-7 text-base text-slate-800 hover:bg-slate-50"
              >
                <Link href="/login">Anmelden</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                Kein App-Download nötig
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                Direkt im Browser nutzbar
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Check className="h-4 w-4 text-emerald-600" />
                Für echte Alltagsroutine gebaut
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(15,23,42,0.10),rgba(13,148,136,0.08),rgba(255,255,255,0.0))] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_32px_80px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:p-6">
              <div className="grid gap-4">
                <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc,#ffffff)] p-5 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Heute im Blick
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Klarheit statt Grübeln
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-3">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/75 p-4">
                      <p className="text-sm font-medium text-slate-500">Kalorienziel</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">1.850</p>
                      <p className="mt-1 text-sm text-slate-600">auf dein Profil abgestimmt</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-4 text-white">
                      <p className="text-sm font-medium text-slate-300">Wochenplan</p>
                      <p className="mt-2 text-3xl font-bold">5/7</p>
                      <p className="mt-1 text-sm text-slate-300">Tage schon vorbereitet</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 inline-flex rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                      <Timer className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-slate-900">Schneller planen</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Wiederkehrende Entscheidungen werden leichter.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 inline-flex rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-slate-900">Mehr Überblick</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Rezepte, Ziele und Liste greifen ineinander.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 inline-flex rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-slate-900">Weniger Reibung</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Ein Tool statt Zettel, Notizen und Bauchgefühl.
                    </p>
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
