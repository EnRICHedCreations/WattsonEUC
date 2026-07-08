import { createPublicServerClient } from "@/lib/supabase-server";
import type { SharedRide } from "@/lib/types";

/**
 * Full ride fetch (includes gps_route + telemetry) -- shared between the
 * ride detail page and the replay page so both stay in sync rather than
 * each re-implementing the same query independently.
 */
export async function getRideById(id: string): Promise<SharedRide | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("shared_rides")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as SharedRide;
}


/**
 * Summary shape for list/leaderboard views -- deliberately excludes
 * gps_route and telemetry (the two heavy JSONB columns), since a
 * leaderboard or recent-rides feed never needs per-point data, only the
 * aggregate stats already computed at upload time. Keeping these queries
 * light matters once there are enough rides for these pages to matter.
 */
export type RideSummary = Omit<SharedRide, "gps_route" | "telemetry">;

const SUMMARY_COLUMNS =
  "id, created_at, rider_nickname, wheel_brand, wheel_model, ride_start_time_millis, distance_meters, max_speed_kmh, avg_speed_kmh, max_pwm_percent, max_current_amps, max_power_watts, max_motor_temp_celsius, elevation_gain_meters, start_battery_percent, end_battery_percent";

export async function getRecentRides(limit = 30): Promise<RideSummary[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("shared_rides")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as RideSummary[];
}

export async function getTopSpeedLeaderboard(limit = 20): Promise<RideSummary[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("shared_rides")
    .select(SUMMARY_COLUMNS)
    .order("max_speed_kmh", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as RideSummary[];
}

export async function getTopDistanceLeaderboard(limit = 20): Promise<RideSummary[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("shared_rides")
    .select(SUMMARY_COLUMNS)
    .order("distance_meters", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as RideSummary[];
}
