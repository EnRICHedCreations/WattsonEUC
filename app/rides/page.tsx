import { getRecentRides } from "@/lib/queries";
import { RideSummaryCard } from "@/components/RideSummaryCard";
import { SiteHeader } from "@/components/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Rides -- Wattson",
};

export const revalidate = 30;

export default async function RidesPage() {
  const rides = await getRecentRides(30);

  return (
    <>
      <SiteHeader />
      <main className="relative max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10 fade-up">
          <div className="font-mono-data text-reactor-blue text-xs uppercase tracking-[0.3em] mb-2">
            // Community
          </div>
          <h1 className="font-display text-4xl font-700 text-cream">Recent Rides</h1>
        </div>

        {rides.length === 0 ? (
          <div className="bg-surface/50 rounded-lg p-8 text-center text-cream/40 text-sm fade-up">
            No rides shared yet. Be the first to share one from the app.
          </div>
        ) : (
          <div className="space-y-2 fade-up" style={{ animationDelay: "0.1s" }}>
            {rides.map((ride) => (
              <RideSummaryCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
