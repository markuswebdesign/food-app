"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, UserPlus, Check, X, Trash2, Search } from "lucide-react";
import Link from "next/link";

type Profile = { id: string; username: string; avatar_url: string | null };
type Connection = {
  id: string;
  status: "pending" | "accepted";
  created_at: string;
  requester: Profile;
  recipient: Profile;
};
type SharedItem = {
  id: string;
  status: string;
  created_at: string;
  sender: Profile;
  recipe: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    servings: number;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
  };
};

interface Props {
  currentUserId: string;
  initialConnections: Connection[];
  initialInbox: SharedItem[];
}

export function ConnectionsClient({ currentUserId, initialConnections, initialInbox }: Props) {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [inbox, setInbox] = useState<SharedItem[]>(initialInbox);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const accepted = connections.filter((c) => c.status === "accepted" && c.requester && c.recipient);
  const pendingReceived = connections.filter(
    (c) => c.status === "pending" && c.recipient?.id === currentUserId
  );
  const pendingSent = connections.filter(
    (c) => c.status === "pending" && c.requester?.id === currentUserId
  );

  function otherUser(c: Connection): Profile {
    return c.requester?.id === currentUserId ? c.recipient : c.requester;
  }

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/connections?search=${encodeURIComponent(search.trim())}`);
    const data = await res.json();
    setSearchResults(data.profiles ?? []);
    setSearching(false);
  }

  function connectionStatusWith(userId: string) {
    return connections.find(
      (c) => c.requester.id === userId || c.recipient.id === userId
    );
  }

  async function sendRequest(recipientId: string) {
    setLoadingId(recipientId);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    if (res.ok) {
      router.refresh();
      setSearch("");
      setSearchResults([]);
    }
    setLoadingId(null);
  }

  async function handleAccept(connectionId: string) {
    setLoadingId(connectionId);
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    if (res.ok) {
      setConnections((prev) =>
        prev.map((c) => c.id === connectionId ? { ...c, status: "accepted" } : c)
      );
    }
    setLoadingId(null);
  }

  async function handleDecline(connectionId: string) {
    setLoadingId(connectionId);
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    });
    if (res.ok) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    }
    setLoadingId(null);
  }

  async function handleRemove(connectionId: string) {
    setLoadingId(connectionId);
    const res = await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
    if (res.ok) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    }
    setLoadingId(null);
  }

  async function handleCopyRecipe(shareId: string) {
    setCopyingId(shareId);
    const res = await fetch(`/api/shared-recipes/${shareId}`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setInbox((prev) => prev.filter((i) => i.id !== shareId));
      router.push(`/recipes/${data.recipeId}`);
    }
    setCopyingId(null);
  }

  async function handleDismiss(shareId: string) {
    setCopyingId(shareId);
    await fetch(`/api/shared-recipes/${shareId}`, { method: "PATCH" });
    setInbox((prev) => prev.filter((i) => i.id !== shareId));
    setCopyingId(null);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Verbindungen</h1>
        <p className="text-muted-foreground mt-1">
          Finde Freunde und teile Rezepte mit deinen Verbindungen.
        </p>
      </div>

      {/* User Search */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Nutzer suchen</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Benutzername eingeben…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching || !search.trim()} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="rounded-lg border divide-y">
            {searchResults.map((profile) => {
              const existing = connectionStatusWith(profile.id);
              const loading = loadingId === profile.id;
              return (
                <div key={profile.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">@{profile.username}</span>
                  </div>
                  {existing ? (
                    <Badge variant="secondary">
                      {existing.status === "accepted" ? "Verbunden" : "Ausstehend"}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => sendRequest(profile.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {loading ? "…" : "Anfrage senden"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searchResults.length === 0 && search && !searching && (
          <p className="text-sm text-muted-foreground">Keine Nutzer gefunden.</p>
        )}
      </div>

      <Separator />

      {/* Pending incoming */}
      {pendingReceived.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Anfragen <Badge className="ml-1">{pendingReceived.length}</Badge>
          </h2>
          <div className="rounded-lg border divide-y">
            {pendingReceived.map((c) => {
              const other = otherUser(c);
              const loading = loadingId === c.id;
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={other.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {other.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">@{other.username}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={loading} onClick={() => handleAccept(c.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Annehmen
                    </Button>
                    <Button size="sm" variant="outline" disabled={loading} onClick={() => handleDecline(c.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accepted connections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Meine Verbindungen ({accepted.length})</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Verbindungen. Suche nach Nutzern und sende eine Anfrage.
          </p>
        ) : (
          <div className="rounded-lg border divide-y">
            {accepted.map((c) => {
              const other = otherUser(c);
              const loading = loadingId === c.id;
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={other.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {other.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">@{other.username}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={loading}
                    onClick={() => handleRemove(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pending sent */}
        {pendingSent.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Gesendete Anfragen</p>
            <div className="rounded-lg border divide-y">
              {pendingSent.map((c) => {
                const other = otherUser(c);
                const loading = loadingId === c.id;
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={other.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {other.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">@{other.username}</p>
                        <p className="text-xs text-muted-foreground">Ausstehend</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive text-xs"
                      disabled={loading}
                      onClick={() => handleRemove(c.id)}
                    >
                      Zurückziehen
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shared Recipes Inbox */}
      {inbox.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Geteilte Rezepte <Badge className="ml-1">{inbox.length}</Badge>
            </h2>
            <div className="space-y-3">
              {inbox.map((item) => {
                const totalTime =
                  (item.recipe.prep_time_minutes ?? 0) + (item.recipe.cook_time_minutes ?? 0);
                const loading = copyingId === item.id;
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.recipe.image_url ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={item.recipe.image_url}
                              alt={item.recipe.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                            🍽
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight">{item.recipe.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Geteilt von @{item.sender.username} · {formatDate(item.created_at)}
                          </p>
                          {item.recipe.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {item.recipe.description}
                            </p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            {totalTime > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {totalTime} Min
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {item.recipe.servings} Portionen
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          disabled={loading}
                          onClick={() => handleCopyRecipe(item.id)}
                        >
                          {loading ? "Wird kopiert…" : "In meine Rezepte kopieren"}
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/recipes/${item.recipe.id}`} target="_blank">
                            Ansehen
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          disabled={loading}
                          onClick={() => handleDismiss(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
