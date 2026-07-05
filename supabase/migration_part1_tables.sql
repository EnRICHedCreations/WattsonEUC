-- Wattson companion site — migration part 1: tables + indexes
-- Run this BEFORE part 2 (policies), per convention: tables referenced by
-- foreign keys/policies must exist first or policy creation errors out.

create extension if not exists pgcrypto;

create table if not exists public.shared_rides (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Rider-supplied at upload time; nullable since a nickname is optional.
  rider_nickname text,

  wheel_brand text not null,
  wheel_model text not null,

  ride_start_time_millis bigint not null,
  distance_meters double precision not null default 0,
  max_speed_kmh real not null default 0,
  avg_speed_kmh real not null default 0,
  max_pwm_percent real not null default 0,
  max_current_amps real not null default 0,
  max_power_watts real not null default 0,
  max_motor_temp_celsius real,
  elevation_gain_meters double precision not null default 0,
  start_battery_percent int not null default 0,
  end_battery_percent int,

  -- Arrays of points, stored as JSONB rather than normalized tables —
  -- a shared ride is read-heavy, write-once, and never queried by
  -- individual point, so JSONB keeps this simple without a real cost.
  -- gps_route: [{ "lat": number, "lon": number, "timestampMillis": number }]
  -- telemetry: [{ "timestampMillis": number, "speedKmh": number, "pwmPercent": number,
  --               "batteryPercent": number, "voltage": number, "current": number, "powerWatts": number }]
  gps_route jsonb not null default '[]'::jsonb,
  telemetry jsonb not null default '[]'::jsonb
);

create index if not exists idx_shared_rides_created_at on public.shared_rides (created_at desc);
