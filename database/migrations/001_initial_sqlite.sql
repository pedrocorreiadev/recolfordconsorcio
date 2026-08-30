create table if not exists schema_migrations (
  version text primary key,
  applied_at text not null default (datetime('now'))
);

create table if not exists campaigns (
  id integer primary key autoincrement,
  title text not null,
  subtitle text not null default '',
  segment text not null check (segment in ('carro', 'imovel', 'moto')),
  credit real not null,
  term integer not null,
  admin_rate real not null,
  insurance_rate real not null,
  reduced_percent real not null default 75,
  featured integer not null default 0,
  active integer not null default 1,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists specialists (
  id text primary key check (id in ('flavio', 'jessica', 'jersey')),
  slug text not null unique,
  name text not null,
  instagram_user text not null,
  instagram_url text not null,
  description text not null default '',
  photo_path text not null default '',
  video_path text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  active integer not null default 1,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists leads (
  id integer primary key autoincrement,
  name text not null,
  contact_value text not null,
  contact_type text not null check (contact_type in ('whatsapp', 'email')),
  goal text not null check (goal in ('carro', 'imovel', 'moto')),
  credit real not null,
  term integer not null,
  estimated_installment real not null,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'em_acompanhamento', 'em_proposta', 'fechado', 'perdido')),
  temperature text not null default 'nao_classificado' check (temperature in ('nao_classificado', 'quente', 'morno', 'frio')),
  preferred_specialist_id text references specialists(id),
  assigned_specialist_id text references specialists(id),
  admin_notes text not null default '',
  updated_by text references specialists(id),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_temperature_idx on leads (temperature);
create index if not exists leads_assigned_specialist_idx on leads (assigned_specialist_id);
create index if not exists campaigns_active_segment_idx on campaigns (active, segment);
