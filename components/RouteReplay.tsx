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

  // One-time map setup: base tile layer + faint full-route guide line.
  useEffect(() => {
    if (!containerRef.current || route.length < 2 || mapRef.current) return;

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
  }, [route]);

  // Redraws the traveled segment + marker position whenever progress changes.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || route.length < 2) return;

    const travelIndex = Math.min(route.length - 1, Math.floor(progress * (route.length - 1)));
    const traveledLatLngs: [number, number][] = route.slice(0, travelIndex + 1).map((p) => [p.lat, p.lon]);

    if (traveledLatLngs.length >= 1) {
      traveledLineRef.current?.setLatLngs(traveledLatLngs);
      const current = traveledLatLngs[traveledLatLngs.length - 1];
      markerRef.current?.setLatLng(current);
      map.panTo(current, { animate: false });
    }
  }, [progress, route]);

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

  function handleScrub(value: number) {
    setIsPlaying(false);
    setProgress(value);
  }

  const currentTelemetry = getNearestTelemetry(route, telemetry, progress);

  if (route.length < 2) {
    return (
      <div className="bg-surface/50 rounded-lg p-8 text-center text-cream/40 text-sm">
        Not enough GPS data for a replay.
      </div>
    );
  }

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
          onChange={(e) => handleScrub(parseFloat(e.target.value))}
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

function getNearestTelemetry(
  route: GpsRoutePoint[],
  telemetry: TelemetryPointDto[],
  progress: number
): TelemetryPointDto | null {
  if (route.length === 0 || telemetry.length === 0) return null;
  const routeIndex = Math.min(route.length - 1, Math.floor(progress * (route.length - 1)));
  const targetTimestamp = route[routeIndex].timestampMillis;

  let nearest = telemetry[0];
  let smallestDelta = Math.abs(telemetry[0].timestampMillis - targetTimestamp);
  for (const point of telemetry) {
    const delta = Math.abs(point.timestampMillis - targetTimestamp);
    if (delta < smallestDelta) {
      smallestDelta = delta;
      nearest = point;
    }
  }
  return nearest;
}
