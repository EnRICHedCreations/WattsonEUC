# Wattson Web

Companion site for the Wattson EUC ride-tracking app. Public ride-sharing pages live at `wattsoneuc.com/ride/[id]` — every shared ride shows the same instrument-cluster gauge, real map, and telemetry the app itself records.

## Stack

Next.js 15 (App Router, TypeScript), Supabase (Postgres + RLS), Leaflet (free OSM map tiles, no API key), Tailwind v4. No Stripe/billing — this is a free public sharing layer, not a paid product tier.

## 1. Set up Supabase

1. Create a project at supabase.com if you don't have one yet.
2. Open the SQL Editor and run the two migration files **in order**:
   - `supabase/migration_part1_tables.sql`
   - `supabase/migration_part2_policies.sql`
3. Go to Settings → API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (never expose this to the browser)

## 2. Local setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your real values
npm run dev
```

Visit `http://localhost:3000`.

## 3. Generate an upload API key

The Android app authenticates to this site's upload endpoint with a simple shared secret (not a full auth system — appropriate for a single-app client, not a multi-tenant API). Generate one:

```bash
openssl rand -hex 32
```

Put that value in `RIDE_UPLOAD_API_KEY` in your `.env.local` (and later, in Vercel's environment variables).

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Wattson web app"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

## 5. Deploy to Vercel

1. Go to vercel.com → **Add New Project** → import the GitHub repo you just pushed
2. Under **Environment Variables**, add all five from `.env.example` with your real values
3. Deploy
4. Once live, point your domain (`wattsoneuc.com`) at the Vercel project under Vercel's **Domains** settings

## How the Android app uploads a ride

POST to `https://wattsoneuc.com/api/rides` with header `x-api-key: <your RIDE_UPLOAD_API_KEY>` and a JSON body matching `UploadRideRequest` in `lib/types.ts`:

```json
{
  "wheelBrand": "BEGODE",
  "wheelModel": "Race",
  "rideStartTimeMillis": 1735900000000,
  "distanceMeters": 3200.5,
  "maxSpeedKmh": 45.2,
  "avgSpeedKmh": 22.1,
  "maxPwmPercent": 62.0,
  "maxCurrentAmps": 18.4,
  "maxPowerWatts": 3200,
  "elevationGainMeters": 40,
  "startBatteryPercent": 91,
  "endBatteryPercent": 78,
  "gpsRoute": [{ "lat": 40.0, "lon": -74.0, "timestampMillis": 1735900001000 }],
  "telemetry": [{ "timestampMillis": 1735900001000, "speedKmh": 20.1, "pwmPercent": 30, "batteryPercent": 90, "voltage": 180.2, "current": 5.1, "powerWatts": 918 }]
}
```

The response is `{ "id": "...", "url": "/ride/<id>" }` — the app should show/share `https://wattsoneuc.com` + that `url`.

**This upload call isn't wired into the Android app yet** — that's the next piece of work whenever you're ready (a small Retrofit/OkHttp call from `RideRepository` after a ride ends, behind a "Share" button so it's opt-in per ride, not automatic).

## Notes on what's intentionally simple here

- No user accounts — rides are identified only by their share link (like a Google Docs "anyone with the link" share), matching how the app itself has no login system yet either
- No rate limiting on the upload endpoint beyond the shared API key and a basic size cap — fine for one app's traffic, would need real rate limiting before this became multi-tenant
- Telemetry/GPS points are stored as JSONB arrays, not normalized tables — appropriate since a shared ride is written once and read many times, never queried point-by-point
