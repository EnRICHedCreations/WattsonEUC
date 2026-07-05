import { SpeedGauge } from "@/components/SpeedGauge";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 md:pt-28">
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

        <p className="text-center text-cream/70 text-lg max-w-xl mx-auto mt-12 mb-16 leading-relaxed fade-up" style={{ animationDelay: "0.45s" }}>
          Speed, PWM, current, and battery — pulled straight from your wheel over Bluetooth.
          Every ride gets a link. Anyone who opens it sees exactly how it went.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-up" style={{ animationDelay: "0.55s" }}>
          <FeatureCard number="01" title="Real telemetry" body="Speed, PWM, current, and temperature straight from your wheel's own hardware." accent="var(--color-reactor-gold)" />
          <FeatureCard number="02" title="Route replay" body="Watch a ride play back on the map with every stat synced to the moment." accent="var(--color-reactor-blue)" />
          <FeatureCard number="03" title="Shareable" body="Every ride gets a link. No account needed to open one." accent="var(--color-suit-red)" />
        </div>

        <p className="text-center text-cream/30 text-xs font-mono-data mt-20 uppercase tracking-[0.2em]">
          Have a ride link? Open it directly to view that ride.
        </p>
      </div>
    </main>
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
