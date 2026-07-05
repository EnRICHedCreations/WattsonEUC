import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { UploadRideRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Check env vars explicitly first -- a missing var here is the most
  // likely real cause of a generic 500, and this distinguishes that case
  // clearly instead of leaving it to surface as an opaque createClient() crash.
  const missingEnvVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnvVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnvVars.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.RIDE_UPLOAD_API_KEY) missingEnvVars.push("RIDE_UPLOAD_API_KEY");

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      { error: `Server is missing environment variables: ${missingEnvVars.join(", ")}. Set these in Vercel's Project Settings > Environment Variables, then redeploy.` },
      { status: 500 }
    );
  }

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.RIDE_UPLOAD_API_KEY) {
    return NextResponse.json({ error: "Unauthorized -- x-api-key header missing or doesn't match RIDE_UPLOAD_API_KEY." }, { status: 401 });
  }

  let body: UploadRideRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.wheelBrand || !body.wheelModel || !Array.isArray(body.gpsRoute)) {
    return NextResponse.json({ error: "Missing required fields (wheelBrand, wheelModel, gpsRoute)" }, { status: 400 });
  }

  if (body.gpsRoute.length > 50_000 || (body.telemetry?.length ?? 0) > 50_000) {
    return NextResponse.json({ error: "Ride data too large" }, { status: 413 });
  }

  try {
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

    if (error) {
      // Surface the REAL Supabase error instead of a generic message --
      // e.g. "relation shared_rides does not exist" means migrations
      // weren't run; a column-type error means a schema mismatch.
      return NextResponse.json({ error: `Database insert failed: ${error.message}` }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Insert succeeded but returned no data -- unexpected." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, url: `/ride/${data.id}` }, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: `Unexpected server error: ${message}` }, { status: 500 });
  }
}