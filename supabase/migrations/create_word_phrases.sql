-- Создание таблицы для хранения фраз, связанных со словами
-- Каждое слово может иметь несколько фраз-примеров

create table if not exists word_phrases (
  id uuid default gen_random_uuid() primary key,
  word_id uuid not null references words(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  english text not null,
  russian text not null,
  context text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Индексы для быстрого поиска
comment on table word_phrases is 'Фразы-примеры связанные со словами в словаре';

-- Политики безопасности (RLS)
alter table word_phrases enable row level security;

-- Пользователи могут видеть только свои фразы
create policy "Users can view own word phrases"
  on word_phrases for select
  using (auth.uid() = user_id);

-- Пользователи могут создавать только свои фразы
create policy "Users can create own word phrases"
  on word_phrases for insert
  with check (auth.uid() = user_id);

-- Пользователи могут обновлять только свои фразы
create policy "Users can update own word phrases"
  on word_phrases for update
  using (auth.uid() = user_id);

-- Пользователи могут удалять только свои фразы
create policy "Users can delete own word phrases"
  on word_phrases for delete
  using (auth.uid() = user_id);
