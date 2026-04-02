export function LandingFooter() {
  return (
    <footer className="bg-[#1D2D18] border-t border-[#F5EFE0]/8 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="font-display text-lg font-semibold text-[#F5EFE0]">
          food<span className="text-[#B85630]">.</span>
        </span>
        <p className="text-xs text-[#F5EFE0]/25">
          © {new Date().getFullYear()} FoodApp — Ernährungsroutine ohne Overhead
        </p>
      </div>
    </footer>
  );
}
