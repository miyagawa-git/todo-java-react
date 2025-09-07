create table if not exists users (
  id serial primary key,
  username varchar(100) unique not null,
  password varchar(255) not null,
  roles varchar(255) not null default 'USER'
);

create table if not exists todos (
  id serial primary key,
  user_id int not null references users(id),
  title varchar(200) not null,
  description text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  priority smallint NOT NULL DEFAULT 0,
  due_date date NULL
);
