"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import type { Category } from "@/lib/types";

export function RecipeFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const mealTimes = categories.filter((c) => c.type === "meal_time");
  const diets = categories.filter((c) => c.type === "diet");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  function handleSearch(value: string) {
    setSearch(value);
    const qs = createQueryString("q", value);
    router.push(`${pathname}?${qs}`);
  }

  function toggleCategory(slug: string, type: "category" | "diet") {
    const key = type === "diet" ? "diet" : "category";
    const current = searchParams.get(key);
    const next = current === slug ? "" : slug;
    router.push(`${pathname}?${createQueryString(key, next)}`);
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Rezepte suchen..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="flex flex-wrap gap-2">
        {mealTimes.map((cat) => (
          <Badge
            key={cat.id}
            variant={searchParams.get("category") === cat.slug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleCategory(cat.slug, "category")}
          >
            {cat.icon} {cat.name}
          </Badge>
        ))}
        <div className="w-px bg-border mx-1" />
        {diets.map((cat) => (
          <Badge
            key={cat.id}
            variant={searchParams.get("diet") === cat.slug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleCategory(cat.slug, "diet")}
          >
            {cat.icon} {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
