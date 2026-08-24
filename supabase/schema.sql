-- Davet schema. Run once against a fresh Supabase project.

create extension if not exists pgcrypto;

create table public.invites (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  slug            text not null unique,
  status          text not null default 'draft'  check (status in ('draft','published')),
  -- False while the address tracks the couple's names; set on manual edit.
  slug_locked     boolean not null default false,
  tradition       text not null default 'islamic' check (tradition in ('islamic','christian')),
  locale          text not null default 'en'     check (locale in ('en','de','tr')),
  theme           text not null default 'ivory-gold',
  opener          text not null default 'veil'   check (opener in ('veil','foil','envelope','direct')),
  timezone        text not null default 'Europe/Berlin',
  partner_a_name  text not null default '',
  partner_b_name  text not null default '',
  hero_image      text,
  invite_card     text,
  sections        jsonb not null default '{}'::jsonb,
  rsvp_deadline   date,
  info_weather    text not null default '',
  info_dress      text not null default '',
  info_parking    text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.events (
  id             uuid primary key default gen_random_uuid(),
  invite_id      uuid not null references public.invites(id) on delete cascade,
  sort           int  not null default 0,
  preset_key     text,
  custom_name    text,
  venue_name     text not null default '',
  venue_address  text not null default '',
  maps_url       text not null default '',
  -- Always an absolute instant. The invitation's timezone turns it back into
  -- a wall clock time; the countdown never uses a local string.
  starts_at      timestamptz not null,
  note           text not null default ''
);

create table public.families (
  id            uuid primary key default gen_random_uuid(),
  invite_id     uuid not null references public.invites(id) on delete cascade,
  side          text not null check (side in ('a','b')),
  person_name   text not null default '',
  parents       text not null default '',
  grandparents  text not null default ''
);

create table public.verses (
  id             uuid primary key default gen_random_uuid(),
  invite_id      uuid not null references public.invites(id) on delete cascade,
  sort           int not null default 0,
  library_key    text,
  custom_arabic  text,
  custom_text    text,
  custom_ref     text
);

create table public.rsvps (
  id           uuid primary key default gen_random_uuid(),
  invite_id    uuid not null references public.invites(id) on delete cascade,
  name         text not null,
  attending    boolean not null,
  guest_count  int not null default 1 check (guest_count between 0 and 20),
  message      text not null default '',
  ip_hash      text,
  created_at   timestamptz not null default now()
);

create table public.wishes (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid not null references public.invites(id) on delete cascade,
  name        text not null,
  message     text not null,
  status      text not null default 'pending' check (status in ('pending','approved','hidden')),
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index on public.events   (invite_id, sort);
create index on public.families (invite_id);
create index on public.verses   (invite_id, sort);
create index on public.rsvps    (invite_id, created_at desc);
create index on public.wishes   (invite_id, status);

-- Row level security --------------------------------------------------------
-- Owners hold full CRUD over their own rows. Anonymous visitors may read a
-- published invitation and its approved wishes, and nothing else. Anonymous
-- writes are denied outright: RSVP and wish submissions go through route
-- handlers that hold the service role, so validation, the honeypot, and rate
-- limiting cannot be bypassed by posting straight at PostgREST.

alter table public.invites  enable row level security;
alter table public.events   enable row level security;
alter table public.families enable row level security;
alter table public.verses   enable row level security;
alter table public.rsvps    enable row level security;
alter table public.wishes   enable row level security;

create policy owner_all on public.invites
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy public_read_published on public.invites
  for select to anon using (status = 'published');

-- Child tables inherit visibility from their invitation.
create or replace function public.owns_invite(i uuid) returns boolean
  language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.invites where id = i and owner_id = auth.uid());
  $$;

create or replace function public.invite_is_published(i uuid) returns boolean
  language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.invites where id = i and status = 'published');
  $$;

create policy owner_all on public.events
  for all using (public.owns_invite(invite_id)) with check (public.owns_invite(invite_id));
create policy public_read on public.events
  for select to anon using (public.invite_is_published(invite_id));

create policy owner_all on public.families
  for all using (public.owns_invite(invite_id)) with check (public.owns_invite(invite_id));
create policy public_read on public.families
  for select to anon using (public.invite_is_published(invite_id));

create policy owner_all on public.verses
  for all using (public.owns_invite(invite_id)) with check (public.owns_invite(invite_id));
create policy public_read on public.verses
  for select to anon using (public.invite_is_published(invite_id));

-- Responses are never public, not even on a published invitation.
create policy owner_all on public.rsvps
  for all using (public.owns_invite(invite_id)) with check (public.owns_invite(invite_id));

create policy owner_all on public.wishes
  for all using (public.owns_invite(invite_id)) with check (public.owns_invite(invite_id));
create policy public_read_approved on public.wishes
  for select to anon using (status = 'approved' and public.invite_is_published(invite_id));

-- Retention ----------------------------------------------------------------
-- Guest personal data is deleted 90 days after the last event. Schedule with
-- pg_cron: select cron.schedule('davet-purge','0 3 * * *','select public.purge_old_guest_data()');

create or replace function public.purge_old_guest_data() returns void
  language sql security definer set search_path = public as $$
    delete from public.rsvps r
     where (select max(e.starts_at) from public.events e where e.invite_id = r.invite_id)
           < now() - interval '90 days';
    delete from public.wishes w
     where (select max(e.starts_at) from public.events e where e.invite_id = w.invite_id)
           < now() - interval '90 days';
  $$;
