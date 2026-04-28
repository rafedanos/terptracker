-- Optional shared backend for real multi-user leaderboards.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reviewer text not null,
  brand text not null,
  strain text not null,
  batch text,
  type text,
  where_purchased text,
  price_paid numeric,
  color text,
  texture text,
  stability text,
  aroma int check (aroma between 1 and 10),
  flavor int check (flavor between 1 and 10),
  complexity int check (complexity between 1 and 10),
  longevity int check (longevity between 1 and 10),
  dab_performance int check (dab_performance between 1 and 10),
  smoothness int check (smoothness between 1 and 10),
  effects int check (effects between 1 and 10),
  overall numeric generated always as ((aroma + flavor + complexity + longevity + dab_performance + smoothness + effects) / 7.0) stored,
  primary_notes text,
  extra_notes text,
  buy_again text,
  verdict_notes text
);

alter table public.reviews enable row level security;
create policy "anyone can read reviews" on public.reviews for select using (true);
create policy "anyone can insert reviews" on public.reviews for insert with check (true);
