import { kmhToMph } from "@/lib/format";

interface SpeedGaugeProps {
  maxSpeedKmh: number;
  maxPwmPercent: number;
  maxGaugeSpeedKmh?: number;
  size?: number;
}

/**
 * Recreates the Android app's circular instrument-cluster gauge as SVG,
 * but with real presence: a glow behind each arc, and a stroke-dashoffset
 * sweep-in animation on mount, so it reads as a HUD powering on rather
 * than a static icon dropped on the page.
 */
export function SpeedGauge({ maxSpeedKmh, maxPwmPercent, maxGaugeSpeedKmh = 80, size = 320 }: SpeedGaugeProps) {
  const center = size / 2;
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.315;
  const startAngle = 135;
  const sweepAngle = 270;

  const speedFraction = Math.min(1, maxSpeedKmh / maxGaugeSpeedKmh);
  const pwmFraction = Math.min(1, maxPwmPercent / 100);

  const outerCircumference = 2 * Math.PI * outerRadius * (sweepAngle / 360);
  const innerCircumference = 2 * Math.PI * innerRadius * (sweepAngle / 360);

  function arcPath(radius: number): string {
    const endAngle = startAngle + sweepAngle;
    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Ambient glow layer behind the whole gauge */}
      <div
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(255,179,0,0.15) 0%, transparent 65%)",
        }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
        <path d={arcPath(outerRadius)} stroke="var(--color-surface-variant)" strokeWidth={size * 0.055} fill="none" strokeLinecap="round" />
        <path
          d={arcPath(outerRadius)}
          stroke="var(--color-reactor-gold)"
          strokeWidth={size * 0.055}
          fill="none"
          strokeLinecap="round"
          className="gauge-arc-animated glow-gold"
          style={{
            strokeDasharray: outerCircumference,
            "--dash-length": outerCircumference * (1 - speedFraction),
          } as React.CSSProperties}
        />

        <path d={arcPath(innerRadius)} stroke="var(--color-surface-variant)" strokeWidth={size * 0.03} fill="none" strokeLinecap="round" />
        <path
          d={arcPath(innerRadius)}
          stroke="var(--color-suit-red)"
          strokeWidth={size * 0.03}
          fill="none"
          strokeLinecap="round"
          className="gauge-arc-animated glow-red"
          style={{
            strokeDasharray: innerCircumference,
            "--dash-length": innerCircumference * (1 - pwmFraction),
            animationDelay: "0.15s",
          } as React.CSSProperties}
        />

        <text x={center} y={center - size * 0.075} textAnchor="middle" className="font-mono-data" fill="var(--color-suit-red)" fontSize={size * 0.065} fontWeight={600} letterSpacing={1}>
          PWM {maxPwmPercent.toFixed(0)}%
        </text>
        <text x={center} y={center + size * 0.1} textAnchor="middle" className="font-display" fill="var(--color-cream)" fontSize={size * 0.2} fontWeight={700}>
          {kmhToMph(maxSpeedKmh).toFixed(0)}
        </text>
        <text x={center} y={center + size * 0.19} textAnchor="middle" className="font-mono-data" fill="var(--color-cream)" fontSize={size * 0.045} opacity={0.6} letterSpacing={2}>
          MPH TOP SPEED
        </text>
      </svg>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}
