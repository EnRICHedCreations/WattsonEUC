"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { GpsRoutePoint } from "@/lib/types";

interface RouteMapProps {
  route: GpsRoutePoint[];
}

/**
 * Real OpenStreetMap tiles via Leaflet — free, no API key. Client-only
 * (Leaflet touches `window`), hence the dynamic import inside useEffect
 * rather than a top-level import, which would break server rendering.
 */
export function RouteMap({ route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || route.length < 2) return;
    if (mapInstanceRef.current) return; // avoid re-initializing on re-render

    let map: import("leaflet").Map | undefined;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const latLngs: [number, number][] = route.map((p) => [p.lat, p.lon]);

      L.polyline(latLngs, {
        color: "#B71C1C",
        weight: 5,
      }).addTo(map);

      const startIcon = L.divIcon({
        className: "",
        html: '<div style="width:16px;height:16px;border-radius:50%;background:#FFB300;border:2px solid white;"></div>',
        iconSize: [16, 16],
      });
      const endIcon = L.divIcon({
        className: "",
        html: '<div style="width:16px;height:16px;border-radius:50%;background:#B71C1C;border:2px solid white;"></div>',
        iconSize: [16, 16],
      });

      L.marker(latLngs[0], { icon: startIcon }).addTo(map).bindPopup("Start");
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(map).bindPopup("End");

      map.fitBounds(latLngs, { padding: [30, 30] });
    });

    return () => {
      map?.remove();
      mapInstanceRef.current = null;
    };
  }, [route]);

  if (route.length < 2) {
    return (
      <div className="flex items-center justify-center h-80 bg-surface rounded-lg text-cream/60">
        Not enough GPS data to draw a route.
      </div>
    );
  }

  return <div ref={containerRef} className="h-80 md:h-[420px] w-full rounded-lg overflow-hidden" />;
}
