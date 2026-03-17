"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";

export type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
};

export type LocationMapViewProps = {
  className?: string;
  /** Initial map center [lat, lng]. Default: London. */
  initialCenter?: [number, number];
  /** Initial zoom level. Default 10. */
  initialZoom?: number;
  /** When set, map pans/flys to this center (e.g. after getting user location). */
  center?: [number, number] | null;
  /** Optional radius in km to draw around the center. */
  radiusKm?: number | null;
  /** Called when user clicks the map (e.g. to add a location). */
  onMapClick?: (lat: number, lng: number) => void;
  /** Markers to show on the map. */
  markers?: MapMarker[];
  /** Hint text overlay, e.g. "Click map to add location". */
  hint?: string;
};

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (center != null) {
      map.flyTo(center, 14, { duration: 0.5 });
    }
  }, [map, center]);
  return null;
}

export function LocationMapView({
  className = "",
  initialCenter = [51.505, -0.09],
  initialZoom = 10,
  center: centerProp,
  radiusKm,
  onMapClick,
  markers = [],
  hint,
}: LocationMapViewProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`.trim()}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full rounded-md"
        style={{ minHeight: 200 }}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={centerProp ?? null} />
        <MapClickHandler onMapClick={onMapClick} />
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            {m.label != null && m.label !== "" && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
        {centerProp != null && radiusKm != null && radiusKm > 0 && (
          <Circle
            center={centerProp}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#7C4DFF", fillOpacity: 0.08 }}
          />
        )}
        <ZoomControl />
      </MapContainer>
      {hint != null && hint !== "" && (
        <p className="absolute right-2 top-2 z-1000 text-xs bg-white text-gray-600 px-2 py-1 rounded-sm cursor-pointer">
          {hint}
        </p>
      )}
    </div>
  );
}

function ZoomControl() {
  const map = useMap();
  return (
    <div className="absolute left-2 top-2 z-40 flex flex-col gap-0.5 rounded border border-sparkling-silver bg-white p-0.5 shadow-sm">
      <button
        type="button"
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded text-tranquil-black hover:bg-gray-100 text-lg font-medium"
        onClick={() => map.zoomIn()}
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded text-tranquil-black hover:bg-gray-100 text-lg font-medium"
        onClick={() => map.zoomOut()}
      >
        −
      </button>
    </div>
  );
}
