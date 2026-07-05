import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { UploadRideRequest } from "@/lib/types";

/**
 * Ingest endpoint: authenticate, validate, write to DB, return immediately.
 * No heavy processing happens here — this is a plain write, so there's no
 * async job to hand off (unlike, say, webhook delivery), but the same
 * "keep the ingest endpoint thin" principle applies: don't do anything
 * here beyond validating and inserting.
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.RIDE_UPLOAD_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UploadRideRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.wheelBrand || !body.wheelModel || !Array.isArray(body.gpsRoute)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic size guard — a runaway upload (e.g. a bug sending millions of
  // points) shouldn't be accepted silently.
  if (body.gpsRoute.length > 50_000 || (body.telemetry?.length ?? 0) > 50_000) {
    return NextResponse.json({ error: "Ride data too large" }, { status: 413 });
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("shared_rides")
    .insert({
      rider_nickname: body.riderNickname ?? null,
      wheel_brand: body.wheelBrand,
      wheel_model: body.wheelModel,
      ride_start_time_millis: body.rideStartTimeMillis,
      distance_meters: body.distanceMeters,
      max_speed_kmh: body.maxSpeedKmh,
      avg_speed_kmh: body.avgSpeedKmh,
      max_pwm_percent: body.maxPwmPercent,
      max_current_amps: body.maxCurrentAmps,
      max_power_watts: body.maxPowerWatts,
      max_motor_temp_celsius: body.maxMotorTempCelsius ?? null,
      elevation_gain_meters: body.elevationGainMeters,
      start_battery_percent: body.startBatteryPercent,
      end_battery_percent: body.endBatteryPercent ?? null,
      gps_route: body.gpsRoute.map((p) => ({ lat: p.lat, lon: p.lon, timestampMillis: p.timestampMillis })),
      telemetry: (body.telemetry ?? []).map((t) => ({
        timestampMillis: t.timestampMillis,
        speedKmh: t.speedKmh,
        pwmPercent: t.pwmPercent,
        batteryPercent: t.batteryPercent,
        voltage: t.voltage,
        current: t.current,
        powerWatts: t.powerWatts,
      })),
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to save ride" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, url: `/ride/${data.id}` }, { status: 202 });
}
