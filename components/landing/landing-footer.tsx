export function LandingFooter() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 max-w-6xl text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FoodApp
      </div>
    </footer>
  );
}
