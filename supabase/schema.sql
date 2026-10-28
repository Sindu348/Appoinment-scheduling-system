create extension if not exists pgcrypto;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null default '',
  duration_minutes integer not null
    check (duration_minutes between 10 and 240),
  price_cents integer not null default 0
    check (price_cents >= 0),
  active boolean not null default true
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 30,
  active boolean not null default true,
  check (end_time > start_time),
  unique (weekday, start_time, end_time)
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists appointments_busy_idx
  on appointments (appointment_date, start_time)
  where status in ('pending', 'confirmed');

-- Return available start/end times for a service on a chosen date.
create or replace function available_slots(
  p_service_id uuid,
  p_date date
)
returns table (start_time time, end_time time)
language sql
stable
as $$
  select
    g.slot_start::time,
    (g.slot_start + make_interval(mins => s.duration_minutes))::time
  from services s
  join availability_rules a
    on a.weekday = extract(dow from p_date)::integer
    and a.active
  cross join lateral generate_series(
    p_date + a.start_time,
    p_date + a.end_time - make_interval(mins => s.duration_minutes),
    make_interval(mins => a.slot_minutes)
  ) as g(slot_start)
  where s.id = p_service_id
    and s.active
    and p_date >= current_date
    and (
      p_date > current_date
      or g.slot_start::time > localtime
    )
    and not exists (
      select 1
      from appointments x
      where x.appointment_date = p_date
        and x.status in ('pending', 'confirmed')
        and x.start_time <
          (g.slot_start + make_interval(mins => s.duration_minutes))::time
        and x.end_time > g.slot_start::time
    )
  order by g.slot_start;
$$;

-- Recheck availability and create the appointment within one database transaction.
create or replace function book_appointment(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_service_id uuid,
  p_date date,
  p_start_time time
)
returns appointments
language plpgsql
as $$
declare
  svc services;
  slot record;
  result appointments;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text));

  select *
  into svc
  from services
  where id = p_service_id and active;

  if not found then
    raise exception 'SERVICE_UNAVAILABLE';
  end if;

  select *
  into slot
  from available_slots(p_service_id, p_date)
  where available_slots.start_time = p_start_time;

  if not found then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into appointments (
    service_id,
    customer_name,
    customer_email,
    customer_phone,
    appointment_date,
    start_time,
    end_time
  )
  values (
    p_service_id,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    p_customer_phone,
    p_date,
    p_start_time,
    slot.end_time
  )
  returning * into result;

  return result;
end;
$$;

-- Demo services
insert into services (name, description, duration_minutes, price_cents)
values
  ('First consultation', 'A friendly introduction.', 30, 4500),
  ('Focused session', 'One-to-one session tailored to your goals.', 60, 8500),
  ('Follow-up visit', 'Continue your progress.', 30, 4000)
on conflict (name) do nothing;

-- Demo opening hours: Monday through Friday, 9 AM to 5 PM.
insert into availability_rules (weekday, start_time, end_time)
select day_number, '09:00', '17:00'
from generate_series(1, 5) as day_number
on conflict do nothing;

-- The Express backend uses the server-only Supabase service role key.
-- No public policies are created for browser access.
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table appointments enable row level security;