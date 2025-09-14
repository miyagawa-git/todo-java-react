-- src/main/resources/db/migration/V1__init_tables.sql
-- users / todos 初期スキーマ（PostgreSQL）

-- ユーザ
create table if not exists users (
  id        serial primary key,
  username  varchar(100) unique not null,
  password  varchar(255) not null,
  roles     varchar(255) not null default '0'
);

-- TODO
create table if not exists todos (
  id          serial primary key,
  user_id     int not null references users(id) on delete cascade,
  title       varchar(200) not null,
  description text,
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  priority    smallint not null default 0,
  due_date    date
);

-- 便利インデックス
create index if not exists idx_todos_user_id   on todos(user_id);
create index if not exists idx_todos_done      on todos(done);
create index if not exists idx_todos_due_date  on todos(due_date);

-- updated_at を自動更新するトリガ
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_todos_set_updated_at') then
    create trigger trg_todos_set_updated_at
      before update on todos
      for each row
      execute procedure set_updated_at();
  end if;
end $$;
