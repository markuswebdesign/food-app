"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, User, Users } from "lucide-react";

const TABS = [
  { key: "ubersicht",    label: "Übersicht",    icon: LayoutDashboard },
  { key: "logbuch",      label: "Logbuch",      icon: BookOpen },
  { key: "profil",       label: "Profil",       icon: User },
  { key: "verbindungen", label: "Verbindungen", icon: Users },
] as const;

export function MeTabs() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "ubersicht";

  return (
    <div className="flex border-b gap-0 overflow-x-auto scrollbar-none">
      {TABS.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          href={`/me?tab=${key}`}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap min-h-[44px] shrink-0",
            activeTab === key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden text-[11px]">{label.length > 8 ? label.slice(0, 6) + "…" : label}</span>
        </Link>
      ))}
    </div>
  );
}
