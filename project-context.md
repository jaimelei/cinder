Cinder

a quieter personal cinema

Overview

Cinder is a personal YouTube wrapper.

It does not attempt to replace, reorganize, reinterpret, or improve YouTube's content structure.

Cinder exists solely to present a different visual experience.

The YouTube account remains the source of truth.

Everything visible in Cinder should directly reflect YouTube.

Playlists, videos, metadata, ordering, and organization should remain faithful to YouTube.

Cinder is a different interface, not a different system.

---

Philosophy

Cinder is not a video platform.

It is not a media server.

It is not a recommendation engine.

It is not a content manager.

It is not intended to "fix" YouTube.

Cinder is simply a quieter personal cinema.

The experience should feel calmer and more intentional, but the underlying content and structure remain identical to YouTube.

---

Source of Truth

The YouTube account is the source of truth.

Nothing inside Cinder should become authoritative.

If something changes on YouTube, Cinder should eventually reflect the same change.

YouTube controls:

- Playlists
- Playlist ordering
- Video ordering
- Video additions
- Video removals
- Titles
- Descriptions
- Channel information
- Duration
- Metadata

Cinder merely mirrors them.

---

Content Philosophy

No custom organization should exist.

No additional hierarchy should be invented.

No collections beyond existing YouTube playlists.

No separate libraries.

No custom categorization.

No recommendation systems.

No ratings.

No favorites.

No watch history.

No continue watching.

No user profiles.

No multiple accounts.

No social features.

Cinder should remain a direct reflection of YouTube.

---

Visual Philosophy

Cinder may have a completely different design language.

However, content should remain familiar.

Information visible on YouTube should remain visible inside Cinder.

Examples:

- Thumbnail
- Title
- Channel name
- Duration
- Upload date
- Description
- Playlist membership

The objective is visual reinterpretation, not structural reinterpretation.

---

Playback Philosophy

Playback is continuous.

Navigating throughout Cinder should not interrupt playback.

The active player should persist across route changes.

A persistent mini player should exist.

Users should be able to:

- Continue browsing while watching.
- Collapse the active player into a mini player.
- Restore the player to full view.
- Continue playback while navigating the application.

Playback state should survive route changes.

The player should behave similarly to a persistent media player rather than being tied to individual pages.

The player itself remains the YouTube Embed Player.

Cinder is responsible for maintaining player persistence and mini player behavior.

---

Picture-in-Picture

Picture-in-picture support should rely on browser and YouTube capabilities.

Cinder should expose and preserve PiP compatibility whenever possible.

PiP is not implemented by Cinder itself.

It is provided by the browser and YouTube.

---

Playback Restrictions

Cinder must not attempt to replace or circumvent YouTube playback restrictions.

Background playback, screen-off playback, and platform-specific limitations remain governed by YouTube and the browser.

Cinder should remain fully compliant with YouTube playback behavior.

---

Playback Principles

Playback should feel uninterrupted.

The user experience should encourage continuous viewing while freely navigating the library.

Playback should be independent from page navigation.

The player should be treated as a global application component rather than a page component.

Video sessions should feel persistent and unobtrusive, reinforcing the feeling of a quieter personal cinema.

---

Design Philosophy

Cinder should not feel like an application.

It should feel like a room.

There are no tabs.

There are no settings pages.

There are no destinations competing for attention.

Navigation should emerge naturally from collections.

Collections are the experience.

The interface should disappear behind the feeling of returning.

---

Collection Philosophy

Collections are fixed and intentional.

They are not categories.

They are not folders.

They are emotional contexts.

A collection represents:

- a ritual
- a mood
- a memory
- a place to return to

Collections are places, not containers.

The experience should encourage returning rather than consuming.

Collections are personal and predetermined.

Cinder should respect them rather than reorganize them.

---

Collection Order

Collections are ordered intentionally and should be treated as part of the experience.

The order itself carries meaning.

Current collection order:

1. Savor

Videos reserved for meals and moments worth pairing with food.

2. Eventually

General watch later.

Things waiting patiently.

3. Unscripted

Lives and broadcasts.

Moments that feel spontaneous and personal.

4. Wanderlust

Travel and journeys.

Places beyond the room.

5. Stage Lights

Performances, concerts, music shows, and stages.

6. In Between

Scenic drives and quiet movement.

Transitional moments.

7. Arcade

Games.

Worlds entered temporarily.

8. Frequencies

Podcasts and conversations.

Quiet company.

Collections should be recognizable before they are read.

Different collections should be allowed to develop their own personalities.

Consistency should come from atmosphere rather than uniformity.

---

Application Structure

Cinder intentionally contains very few destinations.

The experience should remain simple and focused.

The application consists primarily of two pages.

---

Landing Page

The landing page occupies the entire screen.

It does not scroll.

Its purpose is introduction and access.

The screen is divided into two parts:

One side explains what Cinder is.

The other side provides access through the password gate.

The landing page should feel calm and intentional.

It exists to welcome rather than authenticate.

---

Home

The home page is the heart of Cinder.

Collections are the navigation.

There are no tabs.

There are no sections competing for attention.

There is no Home, Library, Discover, Subscriptions, Community, or Settings.

Collections themselves are the experience.

The home page exists to present those collections.

---

Collection Pages

Opening a collection reveals its contents.

Collections are destinations.

Each collection should possess its own atmosphere and identity.

Collections should feel like places rather than containers.

The user moves between collections rather than between application sections.

---

Playback

Video playback should not become a page.

Playback is an experience layered on top of navigation.

Videos should open through a modal experience.

Closing the player should return the user to where they were.

The player should feel global rather than page-bound.

A persistent mini player should exist.

Playback should survive navigation.

---

Simplicity

Cinder should resist growth.

New pages should require strong justification.

Complexity should be viewed with suspicion.

There should never be pages for:

- Discover
- Recommendations
- Subscriptions
- Notifications
- Community
- Shorts
- Comments
- Trending
- Accounts
- Profiles
- Settings

The application should remain small.

The experience should feel like returning to a room rather than navigating a platform.

Most interactions should happen within a handful of places.

The objective is not to maximize features.

The objective is to preserve intimacy.

---

Navigation Philosophy

Navigation should remain unobtrusive.

Cinder should not have a traditional sidebar, top bar, or tab system.

A persistent corner navigation should exist.

Positioned near the bottom right, it should feel more like a quiet companion than a navigation system.

On larger screens, the corner navigation may remain visible.

On mobile, it should be collapsible and expandable into a single button.

Collections themselves serve as navigation targets.

Beneath collection links, utility actions should exist:

- Search
- Sync
- Lock

These actions are incidental.

They should never compete with collections for attention.

---

Routes

The application entry route is:

/ for landing page

/app for homepage

/:collection

Collections represent the primary destinations.

Opening a collection reveals its contents.

Video playback should not become its own route.

Videos should open through a modal experience.

The player should remain global and persistent.

---

Search Philosophy

Search should feel like calling for something rather than entering a tool.

Search should not occupy permanent screen space.

Activating search should reveal a floating search field.

The search field should appear near the upper center of the screen.

Its appearance should feel soft and luminous.

Motion should resemble gentle descent rather than abrupt appearance.

Search should feel warm and alive.

Subtle glow is encouraged.

The experience should resemble a glowing ember appearing in darkness.

---

Search Behavior

Search should be contextual.

Search initiated from the home page searches all collections.

Search initiated inside a collection searches only within that collection.

Search should support approximate matching.

Results should not require exact equality.

Search should consider:

- Title similarity
- Channel name similarity

Search should prioritize familiarity and forgiveness over precision.

---

Search Experience

Searching should communicate activity.

Loading states should feel alive and reassuring.

Search results should open through a full-screen modal experience.

Results should feel like temporarily stepping away from the room rather than navigating to another page.

Closing search should restore the previous context.

Search should not create additional routes.

Search should feel transient.

---

Utilities

Cinder intentionally avoids a settings page.

Utility actions are sufficient.

The only utility actions should be:

- Search
- Sync
- Lock

These actions should remain secondary to collections.

Administration should be invisible.

Maintenance should feel incidental.

The user should spend time with collections rather than with the application itself.

---

Visual Direction

Cinder should be dark.

Not pure black.

Darkness should feel inhabited.

Surfaces should resemble charcoal, ash, smoke, matte black, and embers rather than absolute black.

The experience should feel warm rather than cold.

Accent colors should take inspiration from cinders and embers.

Colors should feel atmospheric rather than vibrant.

The palette should remain restrained.

Darkness should dominate.

Accents should exist only to provide warmth and presence.

Gradients should be subtle and atmospheric.

The interface should avoid flatness.

Gradients should resemble:

- embers
- fireplace glow
- candlelight
- monitor glow
- smoke and ash

Glows should be soft.

Never neon.

Never futuristic.

Never cyberpunk.

Light should feel alive but restrained.

The experience should feel illuminated rather than bright.

---

Motion

Motion should not impress.

Motion should reassure.

Nothing should snap aggressively.

Nothing should bounce.

Nothing should shout.

Everything should feel:

- soft
- calm
- slow
- inevitable

Motion should resemble embers slowly moving.

Transitions should feel reassuring rather than expressive.

---

Typography

Typography should possess personality.

Default choices should be avoided.

Typography should feel chosen rather than inherited.

Inter should not be treated as the default answer.

Typography should contribute to atmosphere and identity.

It should feel distinctive without becoming distracting.

---

Space

Silence is part of the experience.

Density should not be maximized.

Interfaces should breathe.

Content should never feel overwhelming.

Empty space should feel intentional.

The experience should encourage staying.

Not rushing.

Not chasing.

Not endlessly clicking.

---

Atmosphere

The experience should feel:

- quiet
- intimate
- warm
- comforting
- familiar
- personal
- slow

The feeling should resemble:

late night

headphones on

warm monitor glow

everyone asleep

nothing demanding attention

only the things worth returning to

---

Direction

Cinder should never feel like:

- YouTube
- Netflix
- a dashboard
- a SaaS product
- social media
- a content feed
- a productivity tool
- a feature showcase

Cinder is a quieter personal cinema.

A place returned to rather than consumed.

---

Metadata Language

Whenever multiple localized versions of metadata are available, English should always be preferred.

Examples:

- Video titles
- Playlist titles
- Descriptions

English metadata should always take precedence if available.

Fallback behavior may use the default metadata provided by YouTube.

Cinder should prioritize consistency over localization.

---

Core Principles

- No video hosting.
- No image hosting.
- No traditional backend server.
- Near-zero operating costs.
- Lightweight frontend.
- Metadata only.
- Playlist-driven architecture.
- Eventual consistency.
- Simplicity over complexity.
- Personal-first experience.
- YouTube remains authoritative.

---

Tech Stack

Frontend

- React
- TypeScript
- Vite
- React Router

Hosting

- Vercel Hobby

Database

- Supabase PostgreSQL

Client

- Supabase Client SDK

Video Source

- YouTube Embed Player

Metadata Ingestion

- YouTube Data API v3

Automation

- GitHub Actions

---

Architecture

YouTube remains the source of truth.

Cinder acts only as a metadata cache and presentation layer.

Supabase stores metadata only.

Videos are streamed directly from YouTube.

No media files are stored.

No image files are stored.

No thumbnails are proxied.

---

Synchronization

Synchronization is based on polling.

GitHub Actions runs every five minutes.

Each sync:

- Reads playlists from YouTube.
- Reads playlist contents.
- Reads metadata.
- Compares against Supabase.
- Inserts newly discovered videos.
- Removes deleted videos.
- Updates ordering.
- Refreshes metadata when necessary.

Synchronization must always be idempotent.

Every successful sync should reconstruct the correct state regardless of previous failures.

---

Manual Sync

A manual "Sync Now" action should exist.

Manual sync and automatic sync must share the same synchronization pipeline.

No duplicate logic should exist.

---

Access

Cinder is intended for personal use.

The landing page is protected by a simple password gate.

There are:

- No users.
- No profiles.
- No accounts.
- No sign-up.
- No login providers.
- No expiration.

A single password protects the site.

Its purpose is only to prevent accidental public access.

Convenience is preferred over strong authentication.

---

Database Philosophy

Supabase exists only as a cache.

It is not authoritative.

YouTube remains authoritative.

Supabase stores:

- youtube_id
- title
- description
- channel
- duration
- thumbnail URL
- upload date
- playlist references
- ordering information

No video files.

No image files.

No thumbnail storage.

---

Database Access

Frontend:

- Read only.

GitHub Actions:

- Insert
- Update
- Delete

The frontend must never perform mutations.

All mutations originate from synchronization.

---

Backend Philosophy

No traditional backend server should exist.

No Express.

No VPS.

No persistent servers.

GitHub Actions acts as the background worker.

A minimal serverless endpoint may exist only for password verification.

---

Environment Variables

GitHub Secrets

Used exclusively by GitHub Actions.

These secrets are never exposed to the frontend.

Examples:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REFRESH_TOKEN
- YOUTUBE_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Google passwords, cookies, and 2FA codes are never stored.

Private playlists are accessed through OAuth tokens.

---

Vercel Environment Variables

Used by the website.

Examples:

- SITE_PASSWORD
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

SITE_PASSWORD should remain server-side and never be exposed to the client.

---

Local Development Environment

Local .env files should mirror Vercel variables.

Examples:

- SITE_PASSWORD
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

YouTube API Usage

The YouTube Data API is used only for synchronization.

Runtime playback must never depend on the API.

User traffic must not affect API quota.

Videos are streamed through the YouTube Embed Player.

Playback is entirely handled by YouTube.

---

Cost Philosophy

The project is designed around free tiers.

Primary services:

- Vercel
- Supabase
- GitHub Actions
- YouTube

Heavy resources are delegated externally.

Operating costs should remain near zero.

---

Reliability Principles

Synchronization should tolerate:

- Delayed GitHub Actions runs.
- Missed schedules.
- Temporary API failures.

The next successful synchronization should always restore consistency.

No operation should assume previous runs succeeded.

---

Scope

Cinder is not intended to become:

- A social network.
- A public platform.
- A YouTube competitor.
- A media hosting service.
- A recommendation engine.
- A media manager.

Cinder is a personal cinema.

A quieter place for experiencing the same YouTube library through a different lens.
