"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";

interface ImportResult {
  title: string;
  ok: boolean;
  error?: string;
}

export function CsvImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
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
    setImporting(true);
    setError(null);
    setResults(null);
    setProgress(0);
    setProgressTotal(0);
    setCurrentTitle(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/recipes/import-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Import fehlgeschlagen");
        setImporting(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const collected: ImportResult[] = [];
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "total") {
              setProgressTotal(event.total);
            } else if (event.type === "progress") {
              setProgress(event.index);
              setCurrentTitle(event.result.title);
              collected.push(event.result);
            } else if (event.type === "done") {
              setResults(collected);
            }
          } catch {
            // ignore malformed event
          }
        }
      }

      if (collected.length > 0 && !results) {
        setResults(collected);
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setImporting(false);
      setCurrentTitle(null);
    }
  }

  const succeeded = results?.filter((r) => r.ok).length ?? 0;
  const failed = results?.filter((r) => !r.ok).length ?? 0;
  const progressPercent = progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!results && !importing && (
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
      {file && !results && !importing && (
        <Button onClick={handleImport} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Importieren
        </Button>
      )}

      {/* Progress */}
      {importing && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Importiere Rezepte…</span>
            <span className="text-muted-foreground tabular-nums">
              {progress} / {progressTotal}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {currentTitle && (
            <p className="text-xs text-muted-foreground truncate">
              ✓ {currentTitle}
            </p>
          )}
        </div>
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
              onClick={() => { setResults(null); setFile(null); setError(null); setProgress(0); }}
              className="flex-1"
            >
              Neue Datei importieren
            </Button>
          </div>
        </div>
      )}

      {/* Format hint */}
      {!results && !importing && (
        <p className="text-xs text-muted-foreground">
          Pflichtspalte: <code className="bg-muted px-1 rounded">recipe_title</code>. Optional:{" "}
          description, servings, prep_time_minutes, cook_time_minutes, category, instructions,
          source_url, image_url, <code className="bg-muted px-1 rounded">ingredient_name</code>, amount, unit.
          Eine Zeile pro Zutat.
        </p>
      )}
    </div>
  );
}
