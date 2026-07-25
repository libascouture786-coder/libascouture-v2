/*
# Extend appointments + create customisation_requests & measurement_preferences tables

## Purpose
Supports Part 5 — Bespoke Customisation, Appointment & Measurement Experience.
The existing `appointments` table (created in an earlier migration) is extended
additively with new nullable columns for the enhanced appointment form.
Two new tables store "Create Your Own Couture" requests and measurement
preferences.

## 1. Modified Tables
### `appointments` (additive ALTER — no existing columns changed)
- `whatsapp` (text, nullable) — WhatsApp number if different from mobile
- `city` (text, nullable) — client city
- `state` (text, nullable) — client state
- `country` (text, nullable) — client country
- `consultation_type` (text, nullable) — showroom_visit / whatsapp / video / phone / premium_bridal
- `preferred_time` (text, nullable) — preferred time slot label
- `budget` (text, nullable) — budget range label
- `event_date` (date, nullable) — actual event date (distinct from preferred_date which is the appointment date)
- `reschedule_token` (text, nullable) — unique token for reschedule link
- `cancellation_token` (text, nullable) — unique token for cancellation link
- `reminder_sent` (boolean, default false) — tracks whether a reminder has been dispatched

## 2. New Tables
### `customisation_requests`
- `id` (uuid, primary key)
- `name` (text, not null)
- `mobile` (text, not null)
- `whatsapp` (text, nullable) — WhatsApp number if different
- `email` (text, nullable) — optional
- `city` (text, nullable)
- `state` (text, nullable)
- `country` (text, nullable)
- `outfit_category` (text, nullable) — e.g. "Bridal Lehenga", "Saree", "Custom Design"
- `occasion` (text, nullable) — e.g. "Wedding", "Reception"
- `event_date` (date, nullable)
- `budget` (text, nullable) — budget range label
- `design_style` (text, nullable) — e.g. "Royal", "Contemporary"
- `fabrics` (text[], nullable) — selected fabrics
- `colors` (text[], nullable) — selected colours
- `embroidery` (text[], nullable) — selected embroidery styles
- `customisation` (text[], nullable) — selected customisation options
- `inspiration_notes` (text, nullable) — Pinterest/Instagram links, mood board notes
- `additional_notes` (text, nullable)
- `status` (text, not null, default 'pending') — pending / reviewed / contacted / archived
- `created_at` (timestamptz, default now())

### `measurement_preferences`
- `id` (uuid, primary key)
- `customisation_request_id` (uuid, FK -> customisation_requests, nullable, ON DELETE CASCADE)
- `name` (text, not null)
- `mobile` (text, not null)
- `measurement_method` (text, not null) — showroom / video_call / tailor / upload_existing / measure_at_home
- `notes` (text, nullable)
- `created_at` (timestamptz, default now())

## 3. Security
- RLS already enabled on `appointments`; existing public INSERT policy remains.
  No new policies needed — the enhanced columns are all nullable and covered
  by the existing `WITH CHECK (true)` INSERT policy.
- Enable RLS on `customisation_requests`: public INSERT for anon/authenticated
  (any visitor may submit a custom design request). No public SELECT/UPDATE/DELETE.
- Enable RLS on `measurement_preferences`: public INSERT for anon/authenticated.
  No public SELECT/UPDATE/DELETE.

## 4. Important Notes
1. All ALTER TABLE statements use `ADD COLUMN IF NOT EXISTS` for idempotency.
2. All CREATE TABLE statements use `IF NOT EXISTS`.
3. Policies use `DROP POLICY IF EXISTS` before `CREATE POLICY` for idempotency.
4. No existing data is modified or deleted — purely additive.
5. The existing AppointmentContext modal (Parts 1-4) continues to work unchanged
   because all new columns are nullable.
*/

-- ── Extend appointments table ──────────────────────────────────────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS consultation_type text,
  ADD COLUMN IF NOT EXISTS preferred_time text,
  ADD COLUMN IF NOT EXISTS budget text,
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS reschedule_token text,
  ADD COLUMN IF NOT EXISTS cancellation_token text,
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

-- ── Create customisation_requests table ───────────────────────────
CREATE TABLE IF NOT EXISTS customisation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  whatsapp text,
  email text,
  city text,
  state text,
  country text,
  outfit_category text,
  occasion text,
  event_date date,
  budget text,
  design_style text,
  fabrics text[],
  colors text[],
  embroidery text[],
  customisation text[],
  inspiration_notes text,
  additional_notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customisation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_customisation_requests" ON customisation_requests;
CREATE POLICY "public_insert_customisation_requests"
ON customisation_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ── Create measurement_preferences table ──────────────────────────
CREATE TABLE IF NOT EXISTS measurement_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customisation_request_id uuid REFERENCES customisation_requests(id) ON DELETE CASCADE,
  name text NOT NULL,
  mobile text NOT NULL,
  measurement_method text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE measurement_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_measurement_preferences" ON measurement_preferences;
CREATE POLICY "public_insert_measurement_preferences"
ON measurement_preferences FOR INSERT
TO anon, authenticated
WITH CHECK (true);
