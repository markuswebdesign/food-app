"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecipe } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Lock, Trash2 } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 25;

export function AdminRecipesTable({ recipes }: { recipes: AdminRecipe[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "global" | "private">("all");
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localRecipes, setLocalRecipes] = useState<AdminRecipe[]>(recipes);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = localRecipes;
    if (filter === "global") list = list.filter((r) => r.is_global);
    if (filter === "private") list = list.filter((r) => !r.is_global);
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((r) => r.title.toLowerCase().includes(q) || (r.username ?? "").toLowerCase().includes(q));
    return list;
  }, [localRecipes, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allPageIds = paginated.map((r) => r.id);
  const allPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selected.has(id));
  const somePageSelected = allPageIds.some((id) => selected.has(id));

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilter(value: "all" | "global" | "private") {
    setFilter(value);
    setPage(1);
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        allPageIds.forEach((id) => next.delete(id));
      } else {
        allPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    if (!confirm(`${selected.size} Rezept${selected.size !== 1 ? "e" : ""} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    setDeleting(true);
    const res = await fetch("/api/admin/recipes/bulk-delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    if (res.ok) {
      setLocalRecipes((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
      router.refresh();
    }
    setDeleting(false);
  }

  async function toggleGlobal(recipe: AdminRecipe) {
    setLoadingId(recipe.id);
    const res = await fetch(`/api/admin/recipes/${recipe.id}/global`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_global: !recipe.is_global }),
    });
    if (res.ok) {
      setLocalRecipes((prev) =>
        prev.map((r) => r.id === recipe.id ? { ...r, is_global: !r.is_global } : r)
      );
    }
    setLoadingId(null);
    router.refresh();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Suche nach Titel oder Nutzer…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {(["all", "global", "private"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter(f)}
            >
              {f === "all" ? "Alle" : f === "global" ? "Global" : "Privat"}
            </Button>
          ))}
        </div>
        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={deleteSelected}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Löschen…" : `${selected.size} löschen`}
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    data-state={somePageSelected && !allPageSelected ? "indeterminate" : undefined}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Alle auswählen"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Titel</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Nutzer</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Erstellt</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Keine Rezepte gefunden.
                  </td>
                </tr>
              )}
              {paginated.map((r) => (
                <tr key={r.id} className={`hover:bg-muted/20 transition-colors ${selected.has(r.id) ? "bg-muted/30" : ""}`}>
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                      aria-label={`${r.title} auswählen`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/recipes/${r.id}`} className="hover:underline" target="_blank">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {r.username ? `@${r.username}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_global ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-200 gap-1">
                        <Globe className="h-3 w-3" /> Global
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" /> Privat
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      disabled={loadingId === r.id}
                      onClick={() => toggleGlobal(r)}
                    >
                      {loadingId === r.id ? "…" : r.is_global ? "Global entfernen" : "Global machen"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} Rezepte · Seite {page} von {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Zurück
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
