import { getTopSpeedLeaderboard, getTopDistanceLeaderboard } from "@/lib/queries";
import { RideSummaryCard } from "@/components/RideSummaryCard";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDistanceMeters, formatSpeed } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard -- Wattson",
};

export const revalidate = 60; // leaderboards don't need to be second-fresh

export default async function LeaderboardPage() {
  const [topSpeed, topDistance] = await Promise.all([
    getTopSpeedLeaderboard(20),
    getTopDistanceLeaderboard(20),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="relative max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10 fade-up">
          <div className="font-mono-data text-reactor-gold text-xs uppercase tracking-[0.3em] mb-2">
            // Leaderboard
          </div>
          <h1 className="font-display text-4xl font-700 text-cream">Top Rides</h1>
        </div>

        <section className="mb-12 fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="font-display text-cream/70 text-sm uppercase tracking-[0.2em] mb-4">
            Top Speed
          </h2>
          {topSpeed.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {topSpeed.map((ride, i) => (
                <RideSummaryCard
                  key={ride.id}
                  ride={ride}
                  rank={i + 1}
                  rankMetric={formatSpeed(ride.max_speed_kmh, 0)}
                  rankColor="var(--color-reactor-gold)"
                />
              ))}
            </div>
          )}
        </section>

        <section className="fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-display text-cream/70 text-sm uppercase tracking-[0.2em] mb-4">
            Longest Distance
          </h2>
          {topDistance.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {topDistance.map((ride, i) => (
                <RideSummaryCard
                  key={ride.id}
                  ride={ride}
                  rank={i + 1}
                  rankMetric={formatDistanceMeters(ride.distance_meters)}
                  rankColor="var(--color-reactor-blue)"
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface/50 rounded-lg p-8 text-center text-cream/40 text-sm">
      No rides shared yet. Be the first.
    </div>
  );
}
