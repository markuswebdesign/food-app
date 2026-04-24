create table if not exists staple_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  amount      numeric,
  unit        text,
  category    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table staple_items enable row level security;

create policy "Users see own staple items"
  on staple_items for select
  using (auth.uid() = user_id);

create policy "Users insert own staple items"
  on staple_items for insert
  with check (auth.uid() = user_id);

create policy "Users update own staple items"
  on staple_items for update
  using (auth.uid() = user_id);

create policy "Users delete own staple items"
  on staple_items for delete
  using (auth.uid() = user_id);

create index staple_items_user_id_idx on staple_items(user_id);
