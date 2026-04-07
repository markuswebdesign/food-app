import { createClient } from "@/lib/supabase/server";
import { ImportForm } from "@/components/recipes/import-form";
import { CsvImportForm } from "@/components/recipes/csv-import-form";

export default async function ImportRecipePage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("type");
  const mode = searchParams.mode === "csv" ? "csv" : "url";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rezept importieren</h1>
        <p className="text-muted-foreground mt-1">
          Rezept von einer Website importieren oder mehrere per CSV hochladen
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b gap-0">
        <a
          href="/recipes/import?mode=url"
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            mode === "url"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          }`}
        >
          URL / Bild
        </a>
        <a
          href="/recipes/import?mode=csv"
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            mode === "csv"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          }`}
        >
          CSV-Import
        </a>
      </div>

      {mode === "csv" ? (
        <CsvImportForm />
      ) : (
        <ImportForm categories={categories ?? []} />
      )}
    </div>
  );
}
