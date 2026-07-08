import { getRideById } from "@/lib/queries";
import { RouteReplay } from "@/components/RouteReplay";
import { SiteHeader } from "@/components/SiteHeader";
import { PoweredByFooter } from "@/components/PoweredByFooter";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) return { title: "Ride not found -- Wattson" };
  return { title: `Replay -- ${ride.wheel_brand} ${ride.wheel_model} -- Wattson` };
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ride = await getRideById(id);

  if (!ride) {
    return (
      <>
        <SiteHeader />
        <main className="relative min-h-screen flex items-center justify-center text-center px-6">
          <div>
            <h1 className="font-display text-3xl text-cream mb-2">Ride not found</h1>
            <p className="text-cream/50">This link may be broken, or the ride was removed.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen px-4 py-10 md:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-6 fade-up">
          <div className="font-mono-data text-reactor-blue text-[11px] uppercase tracking-[0.3em] mb-1">
            // Replay
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">
            {ride.wheel_brand} {ride.wheel_model}
          </h1>
          <div className="text-cream/50 text-sm font-mono-data">{formatDate(ride.ride_start_time_millis)}</div>
          <Link
            href={`/ride/${ride.id}`}
            className="inline-block mt-3 text-cream/50 hover:text-reactor-gold text-xs font-mono-data uppercase tracking-wide transition-colors"
          >
            ← Back to ride stats
          </Link>
        </div>

        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <RouteReplay route={ride.gps_route} telemetry={ride.telemetry} />
        </div>

        <PoweredByFooter />
      </main>
    </>
  );
}
