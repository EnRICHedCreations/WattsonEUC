const KM_TO_MILES = 0.621371;
const METERS_TO_FEET = 3.28084;

export function kmhToMph(kmh: number): number {
  return kmh * KM_TO_MILES;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function formatSpeed(kmh: number, decimals = 1): string {
  return `${kmhToMph(kmh).toFixed(decimals)} mph`;
}

export function formatDistanceMeters(meters: number): string {
  return `${(meters / 1000 * KM_TO_MILES).toFixed(2)} mi`;
}

export function formatElevationMeters(meters: number): string {
  return `${Math.round(meters * METERS_TO_FEET)} ft`;
}

export function formatTemp(celsius: number | null): string {
  if (celsius === null) return "N/A";
  return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
}

export function formatDate(millis: number): string {
  return new Date(millis).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
