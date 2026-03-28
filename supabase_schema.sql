-- Création de la table des tâches
create table todos (
  id uuid primary key,
  user_id text not null,
  text text not null,
  completed boolean default false,
  date text,
  priority text,
  horizon text default 'short',
  comments jsonb default '[]'::jsonb
);

-- Création de la table des paramètres
create table user_settings (
  user_id text primary key,
  theme text default 'light',
  sort_option text default 'default'
);

-- Activation des politiques de sécurité (RLS)
alter table todos enable row level security;
alter table user_settings enable row level security;

-- Création des politiques d'accès public (lecture et écriture) pour notre système simple basé sur les noms "anas" et "rose"
create policy "Permettre un accès total à tous (todos)" on todos for all using (true) with check (true);
create policy "Permettre un accès total à tous (settings)" on user_settings for all using (true) with check (true);
