"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const supabase = createClient();
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const next = !favorited;
    setFavorited(next);

    if (!next) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id);
      if (error) { console.error("Favorit konnte nicht entfernt werden:", error); setFavorited(!next); return; }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ recipe_id: recipeId, user_id: user.id });
      if (error) { console.error("Favorit konnte nicht gespeichert werden:", error); setFavorited(!next); return; }
    }
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
      aria-label={favorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          favorited ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
}
