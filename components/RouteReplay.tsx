"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { GpsRoutePoint, TelemetryPointDto } from "@/lib/types";
import { kmhToMph } from "@/lib/format";

const PLAYBACK_DURATION_MS = 20_000;

interface RouteReplayProps {
  route: GpsRoutePoint[];
  telemetry: TelemetryPointDto[];
}

/**
 * Animated flyover replay: any ride, short or long, compresses to a fixed
 * ~20-second playback -- mirrors the Android app's replay screen (same
 * cinematic-compression approach). A faint full-route guide line is drawn
 * once; a red "traveled so far" segment and a moving marker update every
 * frame as progress advances, driven by requestAnimationFrame rather than
 * a fixed-interval timer for smooth motion.
 */
export function RouteReplay({ route, telemetry }: RouteReplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const traveledLineRef = useRef<import("leaflet").Polyline | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const hasEnoughData = route.length >= 2;

  // One-time map setup: base tile layer + faint full-route guide line.
  // Guarded by hasEnoughData so this never runs against a too-short route.
  useEffect(() => {
    if (!containerRef.current || !hasEnoughData || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const latLngs: [number, number][] = route.map((p) => [p.lat, p.lon]);

      L.polyline(latLngs, { color: "#4A4238", weight: 3, opacity: 0.6 }).addTo(map);

      traveledLineRef.current = L.polyline([latLngs[0]], { color: "#B71C1C", weight: 5 }).addTo(map);

      const markerIcon = L.divIcon({
        className: "",
        html: '<div style="width:16px;height:16px;border-radius:50%;background:#29B6F6;border:2px solid white;"></div>',
        iconSize: [16, 16],
      });
      markerRef.current = L.marker(latLngs[0], { icon: markerIcon }).addTo(map);

      map.fitBounds(latLngs, { padding: [30, 30] });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [route, hasEnoughData]);

  // Redraws the traveled segment + marker position whenever progress changes.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !hasEnoughData) return;

    const travelIndex = clampIndex(Math.floor(progress * (route.length - 1)), route.length);
    if (travelIndex === null) return;

    const traveledLatLngs: [number, number][] = route.slice(0, travelIndex + 1).map((p) => [p.lat, p.lon]);

    if (traveledLatLngs.length >= 1) {
      traveledLineRef.current?.setLatLngs(traveledLatLngs);
      const current = traveledLatLngs[traveledLatLngs.length - 1];
      markerRef.current?.setLatLng(current);
      map.panTo(current, { animate: false });
    }
  }, [progress, route, hasEnoughData]);

  // requestAnimationFrame-driven playback loop.
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = performance.now() - progress * PLAYBACK_DURATION_MS;

    function tick(now: number) {
      const elapsed = now - startTimeRef.current;
      const newProgress = Math.min(1, elapsed / PLAYBACK_DURATION_MS);
      setProgress(newProgress);

      if (newProgress >= 1) {
        setIsPlaying(false);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  function togglePlay() {
    if (progress >= 1) setProgress(0);
    setIsPlaying((p) => !p);
  }

  function handleScrub(rawValue: string) {
    const value = parseFloat(rawValue);
    if (Number.isNaN(value)) return; // defensively ignore an invalid slider event rather than propagate NaN
    setIsPlaying(false);
    setProgress(value);
  }

  // Not enough data to replay -- bail BEFORE computing anything that
  // indexes into route/telemetry, matching the guard used for map setup.
  if (!hasEnoughData) {
    return (
      <div className="bg-surface/50 rounded-lg p-8 text-center text-cream/40 text-sm">
        Not enough GPS data for a replay.
      </div>
    );
  }

  const currentTelemetry = getNearestTelemetry(route, telemetry, progress);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="h-80 md:h-[420px] w-full rounded-lg overflow-hidden" />

      <div className="bg-surface/70 backdrop-blur-sm rounded-lg p-4 space-y-3">
        {currentTelemetry ? (
          <div className="flex items-baseline gap-4">
            <span className="font-display text-3xl font-700 text-reactor-gold">
              {kmhToMph(currentTelemetry.speedKmh).toFixed(0)} mph
            </span>
            <span className="font-mono-data text-sm text-cream/60">
              PWM {currentTelemetry.pwmPercent.toFixed(0)}% · Battery {currentTelemetry.batteryPercent}%
            </span>
          </div>
        ) : (
          <div className="text-cream/40 text-sm">No telemetry near this point.</div>
        )}

        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => handleScrub(e.target.value)}
          className="w-full accent-suit-red"
        />

        <button
          onClick={togglePlay}
          className="font-display text-sm uppercase tracking-wide px-5 py-2 rounded-full border border-reactor-blue text-reactor-blue hover:bg-reactor-blue hover:text-gunmetal transition-colors"
        >
          {isPlaying ? "Pause" : progress >= 1 ? "Replay" : "Play"}
        </button>
      </div>
    </div>
  );
}

/** Returns a valid array index for the given length, or null if that's not possible (empty array, or a non-finite input like NaN). */
function clampIndex(rawIndex: number, length: number): number | null {
  if (length === 0 || !Number.isFinite(rawIndex)) return null;
  return Math.min(length - 1, Math.max(0, rawIndex));
}

function getNearestTelemetry(
  route: GpsRoutePoint[],
  telemetry: TelemetryPointDto[],
  progress: number
): TelemetryPointDto | null {
  if (route.length === 0 || telemetry.length === 0) return null;

  const routeIndex = clampIndex(Math.floor(progress * (route.length - 1)), route.length);
  const routePoint = routeIndex !== null ? route[routeIndex] : undefined;
  if (!routePoint) return null;

  const targetTimestamp = routePoint.timestampMillis;

  let nearest: TelemetryPointDto | null = null;
  let smallestDelta = Infinity;
  for (const point of telemetry) {
    if (!point) continue;
    const delta = Math.abs(point.timestampMillis - targetTimestamp);
    if (delta < smallestDelta) {
      smallestDelta = delta;
      nearest = point;
    }
  }
  return nearest;
}
