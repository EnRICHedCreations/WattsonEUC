import Link from "next/link";
import { formatDate, formatDistanceMeters, formatSpeed } from "@/lib/format";
import type { RideSummary } from "@/lib/queries";

interface RideSummaryCardProps {
  ride: RideSummary;
  rank?: number;
  rankMetric?: string; // e.g. "45.2 mph" shown large next to the rank, for leaderboard context
  rankColor?: string;
}

export function RideSummaryCard({ ride, rank, rankMetric, rankColor = "var(--color-reactor-gold)" }: RideSummaryCardProps) {
  return (
    <Link
      href={`/ride/${ride.id}`}
      className="block bg-surface/70 backdrop-blur-sm rounded-lg p-4 border-l-2 hover:bg-surface transition-colors"
      style={{ borderColor: rank ? rankColor : "var(--color-outline)" }}
    >
      <div className="flex items-center gap-4">
        {rank !== undefined && (
          <div className="font-display text-2xl font-700 w-8 text-center shrink-0" style={{ color: rankColor }}>
            {rank}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display font-600 text-cream truncate">
              {ride.rider_nickname || "Anonymous rider"}
            </span>
            {rankMetric && (
              <span className="font-mono-data text-lg font-600 shrink-0" style={{ color: rankColor }}>
                {rankMetric}
              </span>
            )}
          </div>
          <div className="text-cream/50 text-xs font-mono-data">
            {ride.wheel_brand} {ride.wheel_model} · {formatDate(ride.ride_start_time_millis)}
          </div>
          {!rankMetric && (
            <div className="text-cream/40 text-xs mt-1">
              {formatDistanceMeters(ride.distance_meters)} · {formatSpeed(ride.max_speed_kmh, 0)} top speed
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
