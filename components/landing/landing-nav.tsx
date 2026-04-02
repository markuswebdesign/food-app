import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          🍽 FoodApp
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Kostenlos starten</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
