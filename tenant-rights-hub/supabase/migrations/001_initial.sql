-- ============================================================
-- TenantRightsHub — initial schema
-- Run this in the Supabase SQL editor before using the app.
-- ============================================================

-- ── statutes ─────────────────────────────────────────────────
create table if not exists statutes (
  id             uuid primary key default gen_random_uuid(),
  state          text not null,
  state_code     text not null,
  statute_title  text,
  chapter        text,
  section_number text,
  section_title  text,
  full_text      text,
  source_url     text,
  last_scraped   timestamp with time zone,
  created_at     timestamp with time zone default now()
);

create index if not exists statutes_state_idx
  on statutes (state);

create index if not exists statutes_state_code_idx
  on statutes (state_code);

create unique index if not exists statutes_section_unique
  on statutes (state_code, section_number);

-- Full-text search index
create index if not exists statutes_fts
  on statutes using gin (
    to_tsvector('english',
      coalesce(section_title, '') || ' ' || coalesce(full_text, '')
    )
  );

-- ── leads ────────────────────────────────────────────────────
create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text not null,
  phone          text,
  state          text,
  property_count text,
  message        text,
  source_page    text,
  created_at     timestamp with time zone default now(),
  sent_to_ghl    boolean default false
);

-- ── Row Level Security on leads ───────────────────────────────
alter table leads enable row level security;

-- Anonymous role may INSERT (lead form submissions)
create policy "anon_can_insert_leads"
  on leads for insert to anon
  with check (true);

-- Service role may SELECT leads (admin dashboard / CRM sync)
create policy "service_role_select_leads"
  on leads for select to service_role
  using (true);

-- Service role may UPDATE leads (e.g. mark sent_to_ghl = true)
create policy "service_role_update_leads"
  on leads for update to service_role
  using (true);
