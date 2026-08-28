create table campaigns (
  id bigint generated always as identity primary key,
  title text not null,
  subtitle text not null default '',
  segment text not null check (segment in ('carro', 'imovel', 'moto')),
  credit numeric(12,2) not null,
  term integer not null,
  admin_rate numeric(8,5) not null,
  insurance_rate numeric(8,5) not null,
  reduced_percent numeric(5,2) not null default 75,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  goal text not null check (goal in ('carro', 'imovel', 'moto')),
  credit numeric(12,2) not null,
  term integer not null,
  estimated_installment numeric(12,2) not null,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'proposta', 'fechado')),
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_created_at_idx on leads (created_at desc);
create index campaigns_active_segment_idx on campaigns (active, segment);
