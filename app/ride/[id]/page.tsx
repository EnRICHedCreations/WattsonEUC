import { createPublicServerClient } from "@/lib/supabase-server";
import { SpeedGauge } from "@/components/SpeedGauge";
import { RouteMap } from "@/components/RouteMap";
import { StatGrid } from "@/components/StatGrid";
import { TelemetryChart } from "@/components/TelemetryChart";
import { PoweredByFooter } from "@/components/PoweredByFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatDate,
  formatDistanceMeters,
  formatElevationMeters,
  formatSpeed,
  formatTemp,
} from "@/lib/format";
import type { SharedRide } from "@/lib/types";
import type { Metadata } from "next";

async function getRide(id: string): Promise<SharedRide | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("shared_rides")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as SharedRide;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ride = await getRide(id);
  if (!ride) return { title: "Ride not found -- Wattson" };

  return {
    title: `${formatSpeed(ride.max_speed_kmh, 0)} top speed -- Wattson`,
    description: `${ride.wheel_brand} ${ride.wheel_model} - ${formatDistanceMeters(ride.distance_meters)}`,
  };
}

export default async function RidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ride = await getRide(id);

  if (!ride) {
    return (
      <>
        <SiteHeader />
        <main className="relative min-h-screen flex items-center justify-center text-center px-6">
          <div className="fade-up">
            <div className="font-mono-data text-suit-red text-xs uppercase tracking-[0.3em] mb-3">// signal lost</div>
            <h1 className="font-display text-4xl text-cream mb-2">Ride not found</h1>
            <p className="text-cream/50">This link may be broken, or the ride was removed.</p>
          </div>
        </main>
      </>
    );
  }

  const speedSeries = ride.telemetry.map((t) => t.speedKmh);
  const pwmSeries = ride.telemetry.map((t) => t.pwmPercent);
  const batterySeries = ride.telemetry.map((t) => t.batteryPercent);
  const voltageSeries = ride.telemetry.map((t) => t.voltage);

  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen px-4 py-14 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-2 fade-up">
        <div className="font-mono-data text-reactor-blue text-[11px] uppercase tracking-[0.3em] mb-1">
          {formatDate(ride.ride_start_time_millis)}
        </div>
        <div className="text-cream/60 text-sm font-display">
          {ride.rider_nickname ? `${ride.rider_nickname} · ` : ""}
          {ride.wheel_brand} {ride.wheel_model}
        </div>
      </div>

      <div className="my-8 fade-up" style={{ animationDelay: "0.1s" }}>
        <SpeedGauge maxSpeedKmh={ride.max_speed_kmh} maxPwmPercent={ride.max_pwm_percent} size={300} />
      </div>

      <div className="fade-up" style={{ animationDelay: "0.2s" }}>
        <StatGrid
          stats={[
            { label: "Distance", value: formatDistanceMeters(ride.distance_meters) },
            { label: "Avg Speed", value: formatSpeed(ride.avg_speed_kmh) },
            { label: "Elevation Gain", value: formatElevationMeters(ride.elevation_gain_meters) },
            { label: "Battery", value: `${ride.start_battery_percent}% -> ${ride.end_battery_percent ?? "?"}%` },
            { label: "Max Current", value: `${ride.max_current_amps.toFixed(1)} A` },
            { label: "Max Power", value: `${Math.round(ride.max_power_watts)} W` },
            { label: "Board Temp", value: formatTemp(ride.max_motor_temp_celsius) },
            { label: "Points Logged", value: `${ride.telemetry.length}` },
          ]}
        />
      </div>

      <div className="mt-10 fade-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="font-display text-cream/70 text-xs uppercase tracking-[0.25em] mb-3">// Route</h2>
        <RouteMap route={ride.gps_route} />
      </div>

      {ride.telemetry.length > 1 && (
        <div className="mt-10 space-y-4 fade-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="font-display text-cream/70 text-xs uppercase tracking-[0.25em]">// Telemetry</h2>
          <TelemetryChart values={speedSeries.map((v) => v * 0.621371)} label="Speed" unit="mph" color="#FFB300" />
          <TelemetryChart values={pwmSeries} label="PWM" unit="%" color="#D4291F" />
          <TelemetryChart values={batterySeries} label="Battery" unit="%" color="#29B6F6" />
          <TelemetryChart values={voltageSeries} label="Voltage" unit="V" color="#FFB300" />
        </div>
      )}

      <PoweredByFooter />
      </main>
    </>
  );
}
