import Link from "next/link";
import { SpeedGauge } from "@/components/SpeedGauge";
import { SiteHeader } from "@/components/SiteHeader";
import { getRecentRides } from "@/lib/queries";
import { RideSummaryCard } from "@/components/RideSummaryCard";

export const revalidate = 30;

export default async function HomePage() {
  const recentRides = await getRecentRides(3);

  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 md:pt-20">
          <div className="text-center mb-4 fade-up">
            <div className="font-mono-data text-reactor-blue text-xs uppercase tracking-[0.35em] mb-6">
              // Electric Unicycle Telemetry
            </div>
          </div>

          <h1 className="font-display text-center text-[18vw] md:text-[10rem] leading-none font-700 text-cream mb-2 fade-up" style={{ animationDelay: "0.1s" }}>
            WATTSON
          </h1>

          <p className="text-center text-cream/50 text-sm md:text-base font-mono-data uppercase tracking-[0.2em] mb-16 fade-up" style={{ animationDelay: "0.2s" }}>
            Real hardware telemetry · Every ride, tracked and shareable
          </p>

          <div className="fade-up" style={{ animationDelay: "0.35s" }}>
            <SpeedGauge maxSpeedKmh={45} maxPwmPercent={62} size={280} />
          </div>

          <p className="text-center text-cream/70 text-lg max-w-xl mx-auto mt-12 mb-10 leading-relaxed fade-up" style={{ animationDelay: "0.45s" }}>
            Speed, PWM, current, and battery — pulled straight from your wheel over Bluetooth.
            Every ride gets a link. Anyone who opens it sees exactly how it went.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16 fade-up" style={{ animationDelay: "0.5s" }}>
            <Link
              href="/leaderboard"
              className="font-display text-sm uppercase tracking-wide px-5 py-2.5 rounded-full border border-reactor-gold text-reactor-gold hover:bg-reactor-gold hover:text-gunmetal transition-colors"
            >
              View Leaderboard
            </Link>
            <Link
              href="/rides"
              className="font-display text-sm uppercase tracking-wide px-5 py-2.5 rounded-full border border-outline text-cream/70 hover:border-reactor-blue hover:text-reactor-blue transition-colors"
            >
              Recent Rides
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-up mb-16" style={{ animationDelay: "0.55s" }}>
            <FeatureCard number="01" title="Real telemetry" body="Speed, PWM, current, and temperature straight from your wheel's own hardware." accent="var(--color-reactor-gold)" />
            <FeatureCard number="02" title="Route replay" body="Watch a ride play back on the map with every stat synced to the moment." accent="var(--color-reactor-blue)" />
            <FeatureCard number="03" title="Shareable" body="Every ride gets a link. No account needed to open one." accent="var(--color-suit-red)" />
          </div>

          {recentRides.length > 0 && (
            <div className="fade-up" style={{ animationDelay: "0.65s" }}>
              <h2 className="font-display text-cream/70 text-sm uppercase tracking-[0.2em] mb-4 text-center">
                Latest Rides
              </h2>
              <div className="space-y-2 max-w-xl mx-auto">
                {recentRides.map((ride) => (
                  <RideSummaryCard key={ride.id} ride={ride} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function FeatureCard({ number, title, body, accent }: { number: string; title: string; body: string; accent: string }) {
  return (
    <div
      className="bg-surface/60 backdrop-blur-sm rounded-lg p-5 border-l-2"
      style={{ borderColor: accent }}
    >
      <div className="font-mono-data text-xs opacity-40 mb-2">{number}</div>
      <div className="font-display text-lg font-600 mb-1" style={{ color: accent }}>
        {title}
      </div>
      <div className="text-cream/50 text-sm leading-relaxed">{body}</div>
    </div>
  );
}
