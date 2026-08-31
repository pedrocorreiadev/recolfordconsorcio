pragma foreign_keys = off;

drop table if exists leads_next;

create table leads_next (
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
  updated_by text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

insert into leads_next (
  id, name, contact_value, contact_type, goal, credit, term, estimated_installment,
  status, temperature, preferred_specialist_id, assigned_specialist_id, admin_notes,
  updated_by, created_at, updated_at
)
select
  id, name, contact_value, contact_type, goal, credit, term, estimated_installment,
  status, temperature, preferred_specialist_id, assigned_specialist_id, admin_notes,
  updated_by, created_at, updated_at
from leads
where exists (select 1 from sqlite_master where type = 'table' and name = 'leads');

drop table if exists leads;
alter table leads_next rename to leads;

pragma foreign_keys = on;

create table if not exists lead_transfers (
  id integer primary key autoincrement,
  lead_id integer not null references leads(id) on delete cascade,
  from_specialist_id text references specialists(id),
  to_specialist_id text references specialists(id),
  admin_id text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_temperature_idx on leads (temperature);
create index if not exists leads_assigned_specialist_idx on leads (assigned_specialist_id);
create index if not exists lead_transfers_lead_id_idx on lead_transfers (lead_id);
