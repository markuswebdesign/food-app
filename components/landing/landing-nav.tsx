import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-slate-950">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-lg text-white shadow-sm">
            F
          </span>
          <span className="tracking-tight">FoodApp</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-slate-700 hover:bg-slate-100 hover:text-slate-950"
          >
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
          >
            <Link href="/register">Kostenlos starten</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
