import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-outline/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-700 text-cream tracking-wide">
          WATTSON
        </Link>
        <nav className="flex items-center gap-5 font-mono-data text-xs uppercase tracking-[0.15em]">
          <Link href="/rides" className="text-cream/60 hover:text-reactor-blue transition-colors">
            Rides
          </Link>
          <Link href="/leaderboard" className="text-cream/60 hover:text-reactor-gold transition-colors">
            Leaderboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
