export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <p className="text-sm font-semibold text-slate-900">FoodApp</p>
          <p className="text-sm text-slate-500">
            Rezepte, Wochenplanung und Tracking in einem klaren Flow.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} FoodApp
        </div>
      </div>
    </footer>
  );
}
