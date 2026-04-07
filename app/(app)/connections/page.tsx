import { createClient } from "@/lib/supabase/server";
import { ConnectionsClient } from "./connections-client";

export default async function ConnectionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("connections")
    .select(`
      id, status, created_at,
      requester:profiles!connections_requester_id_fkey(id, username, avatar_url),
      recipient:profiles!connections_recipient_id_fkey(id, username, avatar_url)
    `)
    .or(`requester_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .in("status", ["accepted", "pending"])
    .order("created_at", { ascending: false });

  // Shared recipes inbox
  const { data: sharedInbox } = await supabase
    .from("shared_recipes")
    .select(`
      id, status, created_at,
      sender:profiles!shared_recipes_sender_id_fkey(id, username, avatar_url),
      recipe:recipes(id, title, description, image_url, servings, prep_time_minutes, cook_time_minutes)
    `)
    .eq("recipient_id", user!.id)
    .neq("status", "dismissed")
    .order("created_at", { ascending: false });

  return (
    <ConnectionsClient
      currentUserId={user!.id}
      initialConnections={(connections ?? []) as any}
      initialInbox={(sharedInbox ?? []) as any}
    />
  );
}
