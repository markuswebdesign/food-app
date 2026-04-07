"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Check } from "lucide-react";

type Profile = { id: string; username: string; avatar_url: string | null };
type Connection = {
  id: string;
  requester: Profile;
  recipient: Profile;
};

interface ShareRecipeButtonProps {
  recipeId: string;
  currentUserId: string;
}

export function ShareRecipeButton({ recipeId, currentUserId }: ShareRecipeButtonProps) {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/connections")
      .then((r) => r.json())
      .then((data) => {
        const accepted = (data.connections ?? []).filter((c: any) => c.status === "accepted");
        const peers: Profile[] = accepted.map((c: Connection) =>
          c.requester.id === currentUserId ? c.recipient : c.requester
        );
        setConnections(peers);
      });
  }, [open, currentUserId]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleShare() {
    if (selected.size === 0) return;
    setLoading(true);
    const res = await fetch("/api/shared-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, recipientIds: Array.from(selected) }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setSelected(new Set());
      }, 1500);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" /> Teilen
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-sm w-full">
        <SheetHeader>
          <SheetTitle>Rezept teilen</SheetTitle>
        </SheetHeader>

        {connections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Du hast noch keine Verbindungen. Gehe zu{" "}
            <a href="/connections" className="underline text-primary">Verbindungen</a>{" "}
            um Freunde hinzuzufügen.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Wähle Verbindungen aus, mit denen du dieses Rezept teilen möchtest:
            </p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {connections.map((c) => {
                const isSelected = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {c.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1">@{c.username}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={handleShare}
              disabled={selected.size === 0 || loading || sent}
              className="w-full"
            >
              {sent ? (
                <><Check className="h-4 w-4 mr-1" /> Gesendet!</>
              ) : loading ? (
                "Wird gesendet…"
              ) : (
                `Teilen${selected.size > 0 ? ` (${selected.size})` : ""}`
              )}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
