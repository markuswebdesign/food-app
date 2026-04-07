import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Falls die Variablen fehlen (z.B. während des Prerenderings), 
  // geben wir leere Strings weiter, damit die Funktion nicht sofort abstürzt.
  return createBrowserClient(
    url ?? "",
    anonKey ?? ""
  );
}