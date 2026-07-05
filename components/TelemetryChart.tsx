interface TelemetryChartProps {
  values: number[];
  label: string;
  unit: string;
  color: string;
}

export function TelemetryChart({ values, label, unit, color }: TelemetryChartProps) {
  if (values.length < 2) return null;

  const width = 600;
  const height = 140;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradientId = `grad-${label.replace(/\s+/g, "-")}`;

  return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-lg p-4 border-l-2" style={{ borderColor: color }}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-display text-cream/80 text-sm uppercase tracking-wide font-600">{label}</span>
        <span className="font-mono-data text-cream/40 text-xs">
          max {max.toFixed(1)} {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
