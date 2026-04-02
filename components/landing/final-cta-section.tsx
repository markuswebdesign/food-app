import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="pb-20 pt-8 md:pb-28">
      <div className="container max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[linear-gradient(135deg,#0f172a,#0f766e_95%)] px-6 py-10 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] md:px-10 md:py-12">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-teal-300/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-amber-100">
                <ShieldCheck className="h-4 w-4" />
                Kostenlos starten und heute noch planen
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Mach es dir leichter, dranzubleiben.
              </h2>
              <p className="text-base leading-7 text-white/80 md:text-lg">
                Erstelle dein Konto, sammle Lieblingsrezepte und bau dir eine Woche,
                die zu deinem Alltag passt.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-7 text-slate-900 hover:bg-amber-50"
              >
                <Link href="/register">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 rounded-full border border-white/20 bg-white/10 px-7 text-white hover:bg-white/15"
              >
                <Link href="/login">Anmelden</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
