create table specialists (
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
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into specialists (id, slug, name, instagram_user, instagram_url, description, photo_path, video_path)
values
  (
    'flavio',
    'flavio-calegario',
    'Flávio Calegário',
    '@recolfordconsorcio',
    'https://www.instagram.com/recolfordconsorcio/',
    'Atuação com Consórcio Disal no Acre, veículos novos e seminovos e simulação sem compromisso.',
    '/media/specialists/flavio/profile.jpg',
    '/media/specialists/flavio/intro.mp4'
  ),
  (
    'jessica',
    'jessica-reis',
    'Jéssica Reis',
    '@jessicareis.rb',
    'https://www.instagram.com/jessicareis.rb/',
    'Atendimento em Rio Branco/AC e planejamento para aquisição de veículos por consórcio.',
    '/media/specialists/jessica/profile.jpg',
    '/media/specialists/jessica/intro.mp4'
  ),
  (
    'jersey',
    'jersey-neves',
    'Jersey Neves',
    '@jerseyneves.consocios',
    'https://www.instagram.com/jerseyneves.consocios/',
    'Biografia profissional pendente de confirmação.',
    '/media/specialists/jersey/profile-1.jpg',
    '/media/specialists/jersey/intro.mp4'
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  instagram_user = excluded.instagram_user,
  instagram_url = excluded.instagram_url,
  description = excluded.description,
  photo_path = excluded.photo_path,
  video_path = excluded.video_path,
  updated_at = now();

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
  contact_value text not null,
  contact_type text not null check (contact_type in ('whatsapp', 'email')),
  goal text not null check (goal in ('carro', 'imovel', 'moto')),
  credit numeric(12,2) not null,
  term integer not null,
  estimated_installment numeric(12,2) not null,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'em_acompanhamento', 'em_proposta', 'fechado', 'perdido')),
  temperature text not null default 'nao_classificado' check (temperature in ('nao_classificado', 'quente', 'morno', 'frio')),
  preferred_specialist_id text references specialists(id),
  assigned_specialist_id text references specialists(id),
  admin_notes text not null default '',
  updated_by text references specialists(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_created_at_idx on leads (created_at desc);
create index leads_status_idx on leads (status);
create index leads_temperature_idx on leads (temperature);
create index leads_assigned_specialist_idx on leads (assigned_specialist_id);
create index campaigns_active_segment_idx on campaigns (active, segment);
