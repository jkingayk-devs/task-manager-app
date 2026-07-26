/* ===========================================
   TaskHub Database
=========================================== */

create table users (

    id uuid primary key,

    username text not null,

    email text unique not null,

    balance numeric default 0,

    coins integer default 0,

    referrals integer default 0,

    completed_tasks integer default 0,

    created_at timestamp default now()

);

create table withdraws (

    id bigint generated always as identity primary key,

    userid uuid references users(id) on delete cascade,

    amount numeric not null,

    method text not null,

    account text,

    status text default 'Pending',

    created_at timestamp default now()

);

/* ===========================================
   Enable Security
=========================================== */

alter table users enable row level security;
alter table withdraws enable row level security;

/* ===========================================
   Users Policies
=========================================== */

create policy "Users can view own profile"

on users

for select

using (

auth.uid() = id

);

create policy "Users can update own profile"

on users

for update

using (

auth.uid() = id

);

create policy "Users can insert own profile"

on users

for insert

with check (

auth.uid() = id

);

/* ===========================================
   Withdraw Policies
=========================================== */

create policy "Users can view own withdraws"

on withdraws

for select

using (

auth.uid() = userid

);

create policy "Users can create withdraw"

on withdraws

for insert

with check (

auth.uid() = userid

);

/* ===========================================
   Indexes
=========================================== */

create index idx_users_email

on users(email);

create index idx_withdraw_userid

on withdraws(userid);
