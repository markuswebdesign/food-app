"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ImportResult {
  title: string;
  ok: boolean;
  error?: string;
}

export function CsvImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResults(null);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) {
      setFile(f);
      setResults(null);
      setError(null);
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/recipes/import-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import fehlgeschlagen");
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  const succeeded = results?.filter((r) => r.ok).length ?? 0;
  const failed = results?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!results && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="space-y-1">
              <FileText className="h-8 w-8 mx-auto text-primary" />
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB — Klicken um eine andere Datei zu wählen
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="font-medium text-sm">CSV-Datei hier ablegen</p>
              <p className="text-xs text-muted-foreground">oder klicken zum Auswählen</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      {/* Import Button */}
      {file && !results && (
        <Button onClick={handleImport} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rezepte werden importiert…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importieren
            </>
          )}
        </Button>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="font-medium text-sm">
                {succeeded} von {results.length} Rezepten importiert
              </p>
              {failed > 0 && (
                <p className="text-xs text-muted-foreground">{failed} fehlgeschlagen</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <Card key={r.title} className={r.ok ? "border-green-200" : "border-destructive/30"}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    {r.error && (
                      <p className="text-xs text-muted-foreground truncate">{r.error}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            {succeeded > 0 && (
              <Button onClick={() => router.push("/recipes")} className="flex-1">
                Zu meinen Rezepten
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => { setResults(null); setFile(null); setError(null); }}
              className="flex-1"
            >
              Neue Datei importieren
            </Button>
          </div>
        </div>
      )}

      {/* Format hint */}
      {!results && (
        <p className="text-xs text-muted-foreground">
          Pflichtspalt: <code className="bg-muted px-1 rounded">recipe_title</code>,{" "}
          <code className="bg-muted px-1 rounded">ingredient_name</code>. Optional: description, servings,
          prep_time_minutes, cook_time_minutes, category, instructions, source_url, image_url, amount, unit.
          Eine Zeile pro Zutat.
        </p>
      )}
    </div>
  );
}
