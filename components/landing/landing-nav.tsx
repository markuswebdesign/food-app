import Link from "next/link";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#F5EFE0]/90 backdrop-blur-md border-b border-[#DDD4BC]/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-[#1D2D18]">
          food<span className="text-[#B85630]">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-[#7A7060] hover:text-[#1D2D18] transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-[#B85630] hover:text-[#9A4220] transition-colors flex items-center gap-1"
          >
            Kostenlos starten
            <span className="text-base leading-none">→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
