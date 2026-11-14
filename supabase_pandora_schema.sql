-- Create pandora_videos table
create table if not exists public.pandora_videos (
    id uuid primary key default gen_random_uuid(),
    youtube_id text not null unique,
    title text not null,
    description text,
    channel_name text,
    channel_id text,
    duration text,
    duration_seconds integer,
    thumbnail_url text,
    upload_date timestamptz,
    group_tag text not null,
    member_tag text,
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_pandora_videos_group_tag on public.pandora_videos(group_tag);
create index if not exists idx_pandora_videos_member_tag on public.pandora_videos(member_tag);
create index if not exists idx_pandora_videos_upload_date on public.pandora_videos(upload_date desc);

-- RLS policy (matching cinder public read behavior)
alter table public.pandora_videos enable row level security;

create policy "Allow public read access"
    on public.pandora_videos
    for select
    to anon, authenticated
    using (true);

create policy "Allow service_role full access"
    on public.pandora_videos
    for all
    to service_role
    using (true)
    with check (true);
