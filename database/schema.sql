create table if not exists app_settings (
  id boolean primary key default true,
  company_name text not null,
  active_gst_profile_id uuid,
  address text not null,
  phone text not null,
  email text,
  logo_text text,
  logo_url text,
  admin_username text not null default 'admin',
  admin_password text not null default 'admin123',
  whatsapp_message text not null,
  constraint app_settings_singleton check (id = true)
);

create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists gst_profiles (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  gst_number text,
  tax_rate numeric(5, 2) not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  pin text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'app_settings_active_gst_fk'
  ) then
    alter table app_settings
      add constraint app_settings_active_gst_fk
      foreign key (active_gst_profile_id) references gst_profiles(id)
      deferrable initially deferred;
  end if;
end $$;

create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price numeric(12, 2) not null default 0,
  hsn text,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  vehicle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  customer_id uuid references customers(id),
  items jsonb not null,
  subtotal numeric(12, 2) not null,
  tax numeric(12, 2) not null,
  total numeric(12, 2) not null,
  gst_profile_id uuid references gst_profiles(id),
  gst_number text,
  tax_rate numeric(5, 2) not null,
  gst_enabled boolean not null,
  created_by_role text not null check (created_by_role in ('user', 'admin')),
  created_at timestamptz not null default now()
);
