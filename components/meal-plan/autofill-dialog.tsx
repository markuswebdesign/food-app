"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AutofillDialogProps {
  onComplete?: () => void;
}

export function AutofillDialog({ onComplete }: AutofillDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooFew, setTooFew] = useState(false);

  async function handleOpen() {
    setError(null);
    setTooFew(false);
    setOpen(true);
  }

  async function handleFill(mode: "overwrite" | "empty-only") {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/meal-plan/autofill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "too_few_favorites") {
        setTooFew(true);
        setLoading(false);
        return;
      }
      setError(data.error ?? "Fehler beim Befüllen");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
    onComplete?.();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
        <Shuffle className="h-4 w-4" />
        Aus Favoriten befüllen
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wochenplan aus Favoriten befüllen</AlertDialogTitle>
            <AlertDialogDescription>
              {tooFew ? (
                <span className="text-destructive">
                  Du hast zu wenige Lieblingsrezepte. Füge mindestens 10 Lieblingsrezepte hinzu, um diese Funktion zu nutzen.
                </span>
              ) : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                "Deine Lieblingsrezepte werden zufällig auf die Woche verteilt."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!tooFew && !error && (
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={loading}>Abbrechen</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={() => handleFill("empty-only")}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Nur leere Slots befüllen
              </Button>
              <Button
                onClick={() => handleFill("overwrite")}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Aktuelle Woche überschreiben
              </Button>
            </AlertDialogFooter>
          )}

          {(tooFew || error) && (
            <AlertDialogFooter>
              <AlertDialogCancel>Schließen</AlertDialogCancel>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
