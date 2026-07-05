interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
}

function StatCard({ label, value, accent = "var(--color-reactor-gold)" }: StatCardProps) {
  return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-lg p-4 border-t-2" style={{ borderColor: accent }}>
      <div className="text-cream/40 text-[10px] uppercase tracking-[0.15em] font-mono-data mb-1">{label}</div>
      <div className="font-display text-2xl font-600 text-cream">{value}</div>
    </div>
  );
}

const ACCENTS = ["var(--color-reactor-gold)", "var(--color-reactor-blue)", "var(--color-suit-red)"];

export function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <StatCard key={s.label} label={s.label} value={s.value} accent={ACCENTS[i % ACCENTS.length]} />
      ))}
    </div>
  );
}
