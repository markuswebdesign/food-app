"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 20;

interface UsersTableProps {
  users: AdminUser[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<AdminUser[]>(users);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return localUsers;
    return localUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.full_name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q))
    );
  }, [localUsers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function handleSetRole(userId: string, role: "admin" | "user") {
    setLoadingId(userId + "_role");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_role", userId, role }),
    });
    if (res.ok) {
      setLocalUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    }
    setLoadingId(null);
    router.refresh();
  }

  async function handleDelete(userId: string) {
    setLoadingId(userId + "_delete");
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setLocalUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setLoadingId(null);
    router.refresh();
  }

  async function handleSetBanned(userId: string, banned: boolean) {
    setLoadingId(userId + "_ban");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_banned", userId, banned }),
    });
    if (res.ok) {
      setLocalUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: banned } : u));
    }
    setLoadingId(null);
    router.refresh();
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Suche nach Name oder E-Mail…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nutzername</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">E-Mail</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Letzter Login</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Registriert</th>
                <th className="px-4 py-3 text-left font-medium">Rolle</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Keine Nutzer gefunden.
                  </td>
                </tr>
              )}
              {paginated.map((u) => {
                const isMe = u.id === currentUserId;
                const roleLoading = loadingId === u.id + "_role";
                const banLoading = loadingId === u.id + "_ban";
                const deleteLoading = loadingId === u.id + "_delete";

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${u.is_banned ? "bg-muted/30 opacity-60" : "hover:bg-muted/20"}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {u.username}
                      {isMe && <span className="ml-1 text-xs text-muted-foreground">(du)</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {u.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_banned ? (
                        <Badge variant="destructive">Gesperrt</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200">Aktiv</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* Role toggle */}
                        {!isMe && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                disabled={roleLoading || banLoading}
                              >
                                {roleLoading ? "…" : u.role === "admin" ? "Entziehen" : "Zum Admin"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rolle ändern</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {u.role === "admin"
                                    ? `Soll ${u.username} die Admin-Rolle entzogen werden?`
                                    : `Soll ${u.username} zum Admin ernannt werden?`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSetRole(u.id, u.role === "admin" ? "user" : "admin")}
                                >
                                  Bestätigen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Ban toggle */}
                        {!isMe && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-xs h-7 ${!u.is_banned ? "text-destructive hover:text-destructive" : ""}`}
                                disabled={roleLoading || banLoading}
                              >
                                {banLoading ? "…" : u.is_banned ? "Entsperren" : "Sperren"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {u.is_banned ? "Account entsperren" : "Account sperren"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {u.is_banned
                                    ? `Soll ${u.username} wieder Zugang zur App erhalten?`
                                    : `Soll ${u.username} gesperrt werden? Der Account wird sofort deaktiviert und alle aktiven Sessions werden beendet.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSetBanned(u.id, !u.is_banned)}
                                  className={!u.is_banned ? "bg-destructive hover:bg-destructive/90" : ""}
                                >
                                  {u.is_banned ? "Entsperren" : "Sperren"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Delete */}
                        {!isMe && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 text-destructive hover:text-destructive"
                                disabled={roleLoading || banLoading || deleteLoading}
                              >
                                {deleteLoading ? "…" : "Löschen"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Account löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Soll <strong>{u.username}</strong> dauerhaft gelöscht werden? Alle Daten
                                  (Rezepte, Mahlzeitenpläne, etc.) werden unwiderruflich entfernt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(u.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Dauerhaft löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {isMe && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} Nutzer · Seite {page} von {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
