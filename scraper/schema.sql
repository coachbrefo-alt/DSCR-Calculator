-- Run this in the Supabase SQL editor before running the scraper.

create table if not exists statutes (
  id              bigserial primary key,
  state           text        not null,
  chapter         text        not null,
  section_number  text        not null,
  title           text        not null,
  body            text        not null,
  url             text        not null,
  scraped_at      timestamptz not null default now(),

  unique (state, section_number)
);

-- Full-text search index for fast ilike queries
create index if not exists statutes_state_idx on statutes (state);
create index if not exists statutes_body_fts  on statutes using gin (to_tsvector('english', title || ' ' || body));
