"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface Props {
  recipeId: string;
}

export function CopyRecipeButton({ recipeId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCopy() {
    setLoading(true);
    const res = await fetch(`/api/recipes/${recipeId}/copy`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/recipes/${data.recipeId}`);
    }
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} disabled={loading}>
      <Copy className="h-4 w-4 mr-1" />
      {loading ? "Wird kopiert…" : "Kopieren"}
    </Button>
  );
}
