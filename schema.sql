-- ====================================================================
-- BioQuanta DB Schema: Email Inquiries & Correspondence Logs
-- To run: Copy-paste this SQL into the Supabase SQL Editor.
-- ====================================================================

-- Enable UUID extension if not already available
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Table: public.inquiries
-- Stores contact/inquiry form submissions from the landing page.
-- --------------------------------------------------------------------
create table if not exists public.inquiries (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    organization text,
    lab_interest text check (lab_interest in ('biodev', 'quantamax', 'general')) default 'general' not null,
    subject text not null,
    message text not null,
    status text check (status in ('new', 'in_progress', 'resolved', 'ignored')) default 'new' not null
);

-- --------------------------------------------------------------------
-- 2. Table: public.correspondence
-- Logs all follow-up emails and communications with the inquirer.
-- --------------------------------------------------------------------
create table if not exists public.correspondence (
    id uuid default uuid_generate_v4() primary key,
    inquiry_id uuid references public.inquiries(id) on delete cascade not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
    sender text not null, -- e.g., 'sohidul@bioquanta.com', 'hr@bioquanta.com'
    recipient text not null, -- visitor's email address
    subject text not null,
    email_body text not null,
    delivery_status text check (delivery_status in ('sent', 'delivered', 'failed')) default 'sent' not null
);

-- --------------------------------------------------------------------
-- 3. Performance Indexes
-- Speed up lookups for status tracking and email searches.
-- --------------------------------------------------------------------
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_email on public.inquiries(email);
create index if not exists idx_correspondence_inquiry on public.correspondence(inquiry_id);

-- --------------------------------------------------------------------
-- 4. Security Policies (Row Level Security - RLS)
-- Secure database from malicious users reading data via the REST API.
-- --------------------------------------------------------------------

-- Enable RLS on tables
alter table public.inquiries enable row level security;
alter table public.correspondence enable row level security;

-- Policy for inquiries: Allow anyone (anon role) to insert new submissions (contact form)
create policy "Allow public submissions" 
on public.inquiries 
for insert 
with check (true);

-- Policy for inquiries: Only authenticated admins can read, update, or delete submissions
create policy "Allow admin read access" 
on public.inquiries 
for select 
to authenticated 
using (true);

create policy "Allow admin update access" 
on public.inquiries 
for update 
to authenticated 
using (true);

create policy "Allow admin delete access" 
on public.inquiries 
for delete 
to authenticated 
using (true);

-- Policy for correspondence: Only authenticated admins can perform any operations
create policy "Only admin full access to correspondence"
on public.correspondence
to authenticated
using (true)
with check (true);
