"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserRoleToggleProps {
  userId: string;
  currentRole: string;
  isCurrentUser: boolean;
}

export function UserRoleToggle({ userId, currentRole, isCurrentUser }: UserRoleToggleProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function toggleRole() {
    const newRole = role === "admin" ? "user" : "admin";
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Fehler");
      setLoading(false);
      return;
    }

    setRole(newRole);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={role === "admin" ? "default" : "secondary"}>
        {role === "admin" ? "Admin" : "User"}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleRole}
        disabled={loading || isCurrentUser}
        title={isCurrentUser ? "Du kannst deine eigene Rolle nicht ändern" : undefined}
        className="text-xs h-7"
      >
        {loading ? "..." : role === "admin" ? "Entziehen" : "Zum Admin"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
